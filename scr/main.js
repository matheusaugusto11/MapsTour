// CONFIGURAÇÃO FIREBASE
// 
const firebaseConfig = {
    apiKey: "AIzaSyAP1QBpty3QW5zlq9pB5sdWGl3H-fswjR4",           // Obtenha do console Firebase
    authDomain: "mapstour-2e65d.firebaseapp.com",       // Obtenha do console Firebase
    projectId: "mapstour-2e65d",                        // Obtenha do console Firebase
    databaseURL: "https://mapstour-2e65d-default-rtdb.firebaseio.com", // Obtenha do console Firebase
    storageBucket: "mapstour-2e65d.firebasestorage.app"         // Obtenha do console Firebase
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 
// VARIÁVEIS GLOBAIS
// 
let arjsManager = null;          // Gerenciador de AR
let geoManager = null;           // Gerenciador de GPS
let firebaseSync = null;         // Sincronização Firebase
const sessionId = generateSessionId();  // ID da sessão
const userId = generateUserId();        // ID do usuário

// 
// ELEMENTOS DO HTML
// 
const mainMenu = document.getElementById('mainMenu');
const arContainer = document.getElementById('arContainer');
const arHUD = document.getElementById('arHUD');
const startARBtn = document.getElementById('startARBtn');
const exitARBtn = document.getElementById('exitARBtn');
const selectTourBtn = document.getElementById('selectTourBtn');
const tourNameEl = document.getElementById('tourName');
const gpsStatusEl = document.getElementById('gpsStatus');
const userCountEl = document.getElementById('userCount');
const nearbyPOIsEl = document.getElementById('nearbyPOIs');
const poiInfoCard = document.getElementById('poiInfo');
const tourModal = document.getElementById('tourModal');
const closeTourModal = document.getElementById('closeTourModal');
const toursList = document.getElementById('toursList');

// 
// EVENTOS DOS BOTÕES
// 

// Botão: Iniciar AR
startARBtn.addEventListener('click', initializeAR);

// Botão: Sair de AR
exitARBtn.addEventListener('click', exitAR);

// Botão: Escolher Tour
selectTourBtn.addEventListener('click', showTourModal);

// Botão: Fechar Modal de Tours
closeTourModal.addEventListener('click', hideTourModal);

// 
// FUNÇÕES PRINCIPAIS
// 

// Função para inicializar AR
async function initializeAR() {
    console.log('🚀 Iniciando AR.js...');
    
    // Esconde menu, mostra AR
    mainMenu.style.display = 'none';
    arContainer.style.display = 'block';
    arHUD.style.display = 'flex';

    try {
        // 1. Inicializa AR.js
        arjsManager = new ARJSManager();
        const success = await arjsManager.initialize('arContainer');
        
        if (!success) {
            alert('❌ Erro ao inicializar AR. Verifique as permissões da câmera.');
            exitAR();
            return;
        }

        console.log('✅ AR.js pronto');

        // 2. Inicializa Geolocalização
        geoManager = new GeoLocationManager();
        try {
            await geoManager.startWatching();
            console.log('✅ GPS pronto');
        } catch (error) {
            alert('⚠️ Geolocalização não disponível: ' + error.message);
        }

        // 3. Inicializa Firebase Sync
        firebaseSync = new FirebaseSync(db, sessionId, userId);
        firebaseSync.startPublishingPosition(geoManager);
        console.log('✅ Firebase pronto');

        // 4. Escolhe o tour (por agora, sempre tour_001)
        const tourId = 'tour_001';

        // 5. Escuta POIs (mudanças em tempo real)
        firebaseSync.listenToPOIs(tourId, (pois) => {
            console.log(`📍 ${pois.length} POIs carregados`);

            if (geoManager.getCurrentPosition()) {
                // Filtra POIs próximos (500 metros)
                const nearbyPOIs = geoManager.getNearbyPOIs(pois, 500);
                
                // Renderiza POIs próximos
                for (const poi of nearbyPOIs) {
                    if (!arjsManager.poiModels.has(poi.id)) {
                        if (poi.model3d) {
                            arjsManager.addPOIAtLocation(poi.id, poi.model3d, 1.0);
                        }
                    }
                }

                // Atualiza lista de POIs próximos na UI
                updateNearbyPOIsList(nearbyPOIs);
            }
        });

        // 6. Escuta informações do tour
        firebaseSync.listenToTour(tourId, (tourData) => {
            tourNameEl.textContent = `Tour: ${tourData.name}`;
        });

        // 7. Escuta outros usuários
        firebaseSync.listenToUsers((users) => {
            const totalUsers = Object.keys(users).length + 1; // +1 para o usuário atual
            userCountEl.textContent = `👥 ${totalUsers} usuários`;

            // Renderiza avatares de outros usuários
            Object.entries(users).forEach(([uid, userData]) => {
                if (userData.position) {
                    let avatar = arjsManager.userAvatars.get(uid);
                    if (!avatar) {
                        avatar = arjsManager.addUserAvatar(uid);
                    }

                    // Posiciona o avatar
                    const currentPos = geoManager.getCurrentPosition();
                    if (currentPos) {
                        // Calcula distância entre usuários
                        const distance = GeoLocationManager.calculateDistance(
                            currentPos.latitude,
                            currentPos.longitude,
                            userData.position.latitude,
                            userData.position.longitude
                        );

                        // Posiciona avatar baseado na distância (simplificado)
                        arjsManager.updateUserPosition(uid, 0, 0, -(distance / 100));
                    }
                }
            });
        });

        // 8. Atualiza GPS na interface
        geoManager.onPositionChange((position) => {
            gpsStatusEl.textContent = 
                `📍 ${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
        });

        console.log('✅ AR iniciado com sucesso!');

    } catch (error) {
        console.error('❌ Erro geral:', error);
        alert('Erro: ' + error.message);
        exitAR();
    }
}

// Função para sair do AR
async function exitAR() {
    console.log('🔚 Encerrando AR...');

    // Para sincronização com Firebase
    if (firebaseSync) {
        firebaseSync.unsubscribeAll();
        await firebaseSync.removeUser();
    }

    // Para GPS
    if (geoManager) {
        geoManager.stopWatching();
    }

    // Limpa AR.js
    if (arjsManager) {
        arjsManager.dispose();
    }

    // Volta ao menu
    mainMenu.style.display = 'block';
    arContainer.style.display = 'none';
    arHUD.style.display = 'none';

    console.log('✅ AR encerrado');
}

// Função para atualizar lista de POIs próximos na UI
function updateNearbyPOIsList(pois) {
    nearbyPOIsEl.innerHTML = ''; // Limpa a lista anterior

    // Mostra até 5 POIs
    pois.slice(0, 5).forEach(poi => {
        if (!geoManager.getCurrentPosition()) return;

        // Calcula distância
        const distance = GeoLocationManager.calculateDistance(
            geoManager.getCurrentPosition().latitude,
            geoManager.getCurrentPosition().longitude,
            poi.position.latitude,
            poi.position.longitude
        );

        // Cria elemento HTML para o POI
        const poiItem = document.createElement('div');
        poiItem.className = 'poi-item';
        poiItem.innerHTML = `
            <strong>${poi.name}</strong>
            <small>${distance.toFixed(0)}m de distância</small>
        `;

        // Clique mostra informações do POI
        poiItem.addEventListener('click', () => {
            showPOIInfo(poi);
        });

        nearbyPOIsEl.appendChild(poiItem);
    });
}

// Função para mostrar informações de um POI
function showPOIInfo(poi) {
    document.getElementById('poiTitle').textContent = poi.name;
    document.getElementById('poiDesc').textContent = poi.description;
    poiInfoCard.style.display = 'block';
}

// Função para mostrar modal de seleção de tours
function showTourModal() {
    // Carrega tours do Firebase
    firebaseSync.listenToTour('tour_001', (tourData) => {
        toursList.innerHTML = `
            <div class="tour-card">
                <h4>${tourData.name}</h4>
                <p>${tourData.description}</p>
                <button class="btn btn-small" onclick="startTourFromModal('tour_001')">
                    Escolher
                </button>
            </div>
        `;
    });

    tourModal.style.display = 'flex';
}

// Função para esconder modal
function hideTourModal() {
    tourModal.style.display = 'none';
}

// Função para iniciar um tour do modal
window.startTourFromModal = function(tourId) {
    hideTourModal();
    initializeAR();
};

// 
// FUNÇÕES AUXILIARES
// 

// Gera um ID único para a sessão
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Gera um ID único para o usuário
function generateUserId() {
    return `user_${Math.random().toString(36).substr(2, 9)}`;
}

// Log de inicialização
console.log(`🎮 Maps Tour iniciado`);
console.log(`Session ID: ${sessionId}`);
console.log(`User ID: ${userId}`);