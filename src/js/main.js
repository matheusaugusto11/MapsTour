// main.js for AR.js Maps Tour
// Manages screen transitions, POI creation/removal, and real-time GPS monitoring
// Compatible with A-Frame 1.4.2 and AR.js master

console.log('🚀 main.js carregou');

// ========================================
// GLOBAL VARIABLES
// ========================================

let watchId = null;
let userLocation = { latitude: 0, longitude: 0, accuracy: 0 };

// ========================================
// HAVERSINE DISTANCE CALCULATION
// ========================================

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // em km
    
    return distance;
}

function formatDistance(distanceKm) {
    if (distanceKm < 1) {
        return `${(distanceKm * 1000).toFixed(0)} m`;
    } else {
        return `${distanceKm.toFixed(2)} km`;
    }
}

// ========================================
// GPS MONITORING
// ========================================

function startGPSMonitoring() {
    console.log('🌍 Iniciando monitoramento de GPS...');
    
    if (!navigator.geolocation) {
        console.error('❌ Geolocalização não suportada neste navegador');
        return;
    }
    
    watchId = navigator.geolocation.watchPosition(
        function(position) {
            userLocation.latitude = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
            userLocation.accuracy = position.coords.accuracy;
            
            console.log(`📍 GPS Atualizado: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)} (±${userLocation.accuracy.toFixed(0)}m)`);
            
            // Atualizar painel HUD
            updateGPSDisplay();
        },
        function(error) {
            console.warn(`⚠️  Erro de GPS: ${error.message}`);
            if (error.code === 1) {
                console.log('   - Permissão negada. Verifique as configurações de localização.');
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function stopGPSMonitoring() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🛑 Monitoramento de GPS parado');
        watchId = null;
    }
}

function updateGPSDisplay() {
    const gpsDisplay = document.getElementById('gps-display');
    
    if (!gpsDisplay) {
        console.warn('⚠️  Elemento #gps-display não encontrado');
        return;
    }
    
    if (typeof pois !== 'undefined' && pois.length > 0) {
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            pois[0].latitude,
            pois[0].longitude
        );
        
        const formattedDistance = formatDistance(distance);
        
        gpsDisplay.innerHTML = `
            <div class="gps-info">
                <p><strong>📍 Sua Localização</strong></p>
                <p>Lat: <span>${userLocation.latitude.toFixed(6)}</span></p>
                <p>Lon: <span>${userLocation.longitude.toFixed(6)}</span></p>
                <p>Precisão: <span>±${userLocation.accuracy.toFixed(0)}m</span></p>
                <hr>
                <p><strong>📌 Distância até ${pois[0].name}</strong></p>
                <p class="distance"><span>${formattedDistance}</span></p>
            </div>
        `;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📡 DOMContentLoaded: Inicializando aplicação');
    
    // Verificar se pois existe
    if (typeof pois === 'undefined') {
        console.error('❌ ERRO: pois não está definido. Certifique-se de que data.js foi carregado.');
        return;
    }
    
    console.log('✅ Array pois carregado com sucesso:', pois.length, 'POIs');
    
    // Aguardar a-scene estar completamente carregada
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', function() {
            console.log('✅ a-scene carregada e pronta');
        });
    }
});

// Event listener para o botão "Iniciar Tour AR"
document.getElementById('start-experience').addEventListener('click', function() {
    console.log('➤ Botão "Iniciar Tour AR" clicado');
    
    try {
        toggleScreens('ar');
        startGPSMonitoring();
        createPOIs();
        console.log('✅ AR iniciado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao iniciar AR:', error);
    }
});

// Event listener para o botão "Sair"
document.getElementById('exit-ar').addEventListener('click', function() {
    console.log('➤ Botão "Sair" clicado');
    
    try {
        stopGPSMonitoring();
        removePOIs();
        toggleScreens('home');
        console.log('✅ AR encerrado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao sair de AR:', error);
    }
});

// ========================================
// SCREEN MANAGEMENT
// ========================================

function toggleScreens(screen) {
    try {
        console.log(`📡 Alternando para tela: ${screen}`);
        
        const homeScreen = document.getElementById('home-screen');
        const arScreen = document.getElementById('ar-screen');
        
        if (screen === 'ar') {
            homeScreen.style.display = 'none';
            arScreen.style.display = 'block';
            console.log('🎬 Tela AR ativada');
        } else if (screen === 'home') {
            arScreen.style.display = 'none';
            homeScreen.style.display = 'block';
            console.log('🏠 Tela Home ativada');
        }
    } catch (error) {
        console.error('❌ Erro em toggleScreens:', error);
    }
}

// ========================================
// POI MANAGEMENT
// ========================================

function createPOIs() {
    console.log('📍 Criando POIs com GPS...');
    
    const scene = document.querySelector('a-scene');
    
    if (!scene) {
        console.error('❌ ERRO: a-scene não encontrada no DOM');
        return;
    }
    
    pois.forEach((poi, index) => {
        try {
            // Extrair dados do modelo
            const primitive = poi.modelo.geometry.primitive;
            const color = poi.modelo.material.color;
            
            // Criar entidade GPS
            const gpsEntity = document.createElement('a-gps-entity-place');
            gpsEntity.setAttribute('latitude', poi.latitude);
            gpsEntity.setAttribute('longitude', poi.longitude);
            gpsEntity.id = `poi-gps-${index}`;
            
            // Criar geometria dentro da entidade GPS
            const entity = document.createElement('a-entity');
            entity.setAttribute('geometry', `primitive: ${primitive}`);
            entity.setAttribute('material', `color: ${color}`);
            entity.setAttribute('position', '0 0 0');
            entity.id = `poi-${index}`;
            
            // Adicionar label de texto
            entity.setAttribute('text', `value: ${poi.name}; align: center; anchor: center; side: double; color: white;`);
            
            // Adicionar entidade dentro da GPS entity
            gpsEntity.appendChild(entity);
            scene.appendChild(gpsEntity);
            
            console.log(`✅ POI ${index} (${poi.name}) criado:`);
            console.log(`   - Geometria: ${primitive}`);
            console.log(`   - Cor: ${color}`);
            console.log(`   - GPS: ${poi.latitude}, ${poi.longitude}`);
            
        } catch (error) {
            console.error(`❌ Erro ao criar POI ${index}:`, error);
        }
    });
    
    console.log(`✅ Todos os ${pois.length} POIs foram criados com sucesso!`);
}

function removePOIs() {
    console.log('🗑️  Removendo POIs...');
    
    const scene = document.querySelector('a-scene');
    
    if (!scene) {
        console.error('❌ ERRO: a-scene não encontrada no DOM');
        return;
    }
    
    pois.forEach((poi, index) => {
        const gpsEntity = document.getElementById(`poi-gps-${index}`);
        
        if (gpsEntity) {
            scene.removeChild(gpsEntity);
            console.log(`✅ POI ${index} (${poi.name}) removido`);
        } else {
            console.warn(`⚠️  POI ${index} (${poi.name}) não encontrado para remover`);
        }
    });
    
    console.log(`✅ Todos os POIs foram removidos com sucesso!`);
}