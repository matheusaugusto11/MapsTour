// ============================================
// MAPS TOUR - APLICAÇÃO PRINCIPAL (SEM BD)
// ============================================

let toursData = null;
let arjsManager = null;
let geoManager = null;
let selectedTourId = 'tour_001';

// ============================================
// 1. CARREGAR DADOS DO JSON
// ============================================

async function loadToursData() {
    try {
        log('info', '📂 Carregando dados...');
        const response = await fetch('data.json');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        toursData = await response.json();
        log('success', `✅ Dados carregados: ${Object.keys(toursData.tours).length} tours`);
        return true;
    } catch (error) {
        log('error', `❌ Erro ao carregar dados: ${error.message}`);
        alert('Erro ao carregar dados dos tours: ' + error.message);
        return false;
    }
}

// ============================================
// 2. INICIALIZAR AR
// ============================================

async function initializeAR() {
    log('info', '🚀 Iniciando AR...');
    
    // Carrega dados se não estiverem carregados
    if (!toursData) {
        const loaded = await loadToursData();
        if (!loaded) return;
    }

    const mainMenu = document.getElementById('mainMenu');
    const arContainer = document.getElementById('arContainer');
    const arHUD = document.getElementById('arHUD');

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

        // 2. Inicializa GPS
        geoManager = new GeoLocationManager();
        try {
            await geoManager.startWatching();
        } catch (error) {
            log('warning', `⚠️ GPS não disponível: ${error.message}`);
        }

        // 3. Carrega tour selecionado
        const tourData = toursData.tours[selectedTourId];
        if (!tourData) {
            alert('❌ Tour não encontrado');
            exitAR();
            return;
        }

        document.getElementById('tourName').textContent = `Tour: ${tourData.name}`;

        // 4. Carrega POIs
        loadPOIs(tourData.pois);

        // 5. Atualiza status
        updateGPSStatus();
        geoManager.onPositionChange(() => {
            updateGPSStatus();
            loadPOIs(tourData.pois);
        });

        log('success', '✅ AR iniciado com sucesso');

    } catch (error) {
        log('error', `❌ Erro ao inicializar AR: ${error.message}`);
        alert('Erro: ' + error.message);
        exitAR();
    }
}

// ============================================
// 3. CARREGAR POIs
// ============================================

function loadPOIs(pois) {
    if (!geoManager.getCurrentPosition()) return;

    const nearbyPOIs = geoManager.getNearbyPOIs(pois, 500);

    // Renderiza modelos 3D
    for (const poi of nearbyPOIs) {
        if (!arjsManager.poiModels.has(poi.id) && poi.model3d) {
            arjsManager.addPOIAtLocation(poi.id, poi.model3d, 0.8);
        }
    }

    // Atualiza lista de POIs
    updateNearbyPOIsList(nearbyPOIs);
}

// ============================================
// 4. ATUALIZAR LISTA DE POIs
// ============================================

function updateNearbyPOIsList(pois) {
    const container = document.getElementById('nearbyPOIs');
    container.innerHTML = '';

    if (pois.length === 0) {
        container.innerHTML = '<div class="poi-item"><small>Nenhum POI próximo</small></div>';
        return;
    }

    pois.slice(0, 5).forEach(poi => {
        const poiItem = document.createElement('div');
        poiItem.className = 'poi-item';
        poiItem.innerHTML = `
            <strong>${poi.name}</strong>
            <span class="distance">${formatDistance(poi.distance)}</span>
            <small>${poi.description.substring(0, 50)}...</small>
        `;
        
        poiItem.addEventListener('click', () => showPOIInfo(poi));
        container.appendChild(poiItem);
    });
}

// ============================================
// 5. MOSTRAR INFO DO POI
// ============================================

function showPOIInfo(poi) {
    const poiCard = document.getElementById('poiInfo');
    document.getElementById('poiTitle').textContent = poi.name;
    document.getElementById('poiDesc').textContent = poi.description;
    poiCard.style.display = 'block';

    // Auto-hide depois de 5 segundos
    setTimeout(() => {
        poiCard.style.display = 'none';
    }, 5000);
}

// ============================================
// 6. ATUALIZAR STATUS GPS
// ============================================

function updateGPSStatus() {
    const gpsEl = document.getElementById('gpsStatus');
    const gps = geoManager.getCurrentPosition();
    
    if (gps) {
        gpsEl.textContent = `📍 ${gps.latitude.toFixed(4)}, ${gps.longitude.toFixed(4)} (±${gps.accuracy.toFixed(0)}m)`;
    } else {
        gpsEl.textContent = '📍 GPS: Aguardando...';
    }
}

// ============================================
// 7. SAIR DO AR
// ============================================

function exitAR() {
    if (geoManager) {
        geoManager.stopWatching();
    }

    if (arjsManager) {
        arjsManager.dispose();
    }

    document.getElementById('mainMenu').style.display = 'block';
    document.getElementById('arContainer').style.display = 'none';
    document.getElementById('arHUD').style.display = 'none';

    log('info', '🔚 AR encerrado');
}

// ============================================
// 8. LISTAR TOURS
// ============================================

async function showToursList() {
    if (!toursData) {
        await loadToursData();
    }

    const toursList = document.getElementById('toursList');
    toursList.innerHTML = '';

    Object.entries(toursData.tours).forEach(([tourId, tourData]) => {
        const tourCard = document.createElement('div');
        tourCard.className = 'tour-card';
        tourCard.innerHTML = `
            <h4>${tourData.name}</h4>
            <p>${tourData.description}</p>
            <div class="tour-meta">
                <span>⏱️ ${tourData.duration}</span>
                <span>📊 ${tourData.difficulty}</span>
                <span>📍 ${tourData.pois.length} POIs</span>
            </div>
            <button class="btn btn-small" onclick="selectTour('${tourId}')">
                Iniciar Tour
            </button>
        `;
        toursList.appendChild(tourCard);
    });

    document.getElementById('tourModal').style.display = 'flex';
}

// ============================================
// 9. SELECIONAR TOUR
// ============================================

window.selectTour = function(tourId) {
    selectedTourId = tourId;
    document.getElementById('tourModal').style.display = 'none';
    initializeAR();
};

// ============================================
// 10. EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    log('info', '🎮 Maps Tour inicializado');

    // Botão: Iniciar AR
    const startARBtn = document.getElementById('startARBtn');
    if (startARBtn) {
        startARBtn.addEventListener('click', initializeAR);
    }

    // Botão: Sair do AR
    const exitARBtn = document.getElementById('exitARBtn');
    if (exitARBtn) {
        exitARBtn.addEventListener('click', exitAR);
    }

    // Botão: Escolher tour
    const selectTourBtn = document.getElementById('selectTourBtn');
    if (selectTourBtn) {
        selectTourBtn.addEventListener('click', showToursList);
    }

    // Botão: Fechar modal
    const closeTourModal = document.getElementById('closeTourModal');
    if (closeTourModal) {
        closeTourModal.addEventListener('click', () => {
            document.getElementById('tourModal').style.display = 'none';
        });
    }

    // Carrega dados no background
    loadToursData();
});

// ============================================
// 11. HANDLE ERROS GLOBAIS
// ============================================

window.addEventListener('error', (event) => {
    log('error', `❌ Erro global: ${event.message}`);
});

window.addEventListener('unhandledrejection', (event) => {
    log('error', `❌ Promise rejeitada: ${event.reason}`);
});