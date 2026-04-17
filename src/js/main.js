// main.js for AR.js Maps Tour
// Complete version with visible HUD panel
// Compatible with A-Frame 1.4.2 and AR.js master

console.log('🚀 main.js carregou');

// ========================================
// GLOBAL VARIABLES
// ========================================

let watchId = null;
let userLocation = { latitude: 0, longitude: 0, accuracy: 0 };
let hudPanel = null;

// ========================================
// HUD PANEL CREATION
// ========================================

function createHUDPanel() {
    console.log('🎨 Criando painel HUD...');
    
    // Remover painel anterior se existir
    if (hudPanel && hudPanel.parentNode) {
        hudPanel.parentNode.removeChild(hudPanel);
    }
    
    // Criar elemento div
    hudPanel = document.createElement('div');
    hudPanel.id = 'gps-display';
    
    // Estilos inline para garantir visibilidade
    hudPanel.style.position = 'fixed';
    hudPanel.style.top = '80px';
    hudPanel.style.left = '20px';
    hudPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    hudPanel.style.color = '#ffffff';
    hudPanel.style.padding = '15px';
    hudPanel.style.borderRadius = '8px';
    hudPanel.style.fontSize = '13px';
    hudPanel.style.fontFamily = '"Courier New", monospace';
    hudPanel.style.zIndex = '9999';
    hudPanel.style.pointerEvents = 'none';
    hudPanel.style.border = '2px solid #667eea';
    hudPanel.style.maxWidth = '280px';
    hudPanel.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.5)';
    hudPanel.style.lineHeight = '1.8';
    
    // Conteúdo inicial
    hudPanel.innerHTML = `
        <div style="color: #8b9df7; font-weight: bold; margin-bottom: 10px;">📍 LOCALIZANDO...</div>
        <div>Aguardando GPS...</div>
    `;
    
    // Adicionar ao body
    document.body.appendChild(hudPanel);
    
    console.log('✅ Painel HUD criado com sucesso');
    console.log('   - Position: fixed (top: 80px, left: 20px)');
    console.log('   - z-index: 9999');
    console.log('   - Elemento adicionado ao body');
}

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
// HUD UPDATE
// ========================================

function updateHUDPanel() {
    if (!hudPanel) {
        console.warn('⚠️  Painel HUD não existe');
        return;
    }
    
    if (userLocation.latitude === 0 && userLocation.longitude === 0) {
        hudPanel.innerHTML = `
            <div style="color: #8b9df7; font-weight: bold; margin-bottom: 10px;">📍 LOCALIZANDO...</div>
            <div>Aguardando sinal GPS...</div>
            <div style="font-size: 11px; color: #aaa; margin-top: 8px;">Ative a localização no navegador</div>
        `;
        return;
    }
    
    let html = `
        <div style="color: #8b9df7; font-weight: bold; margin-bottom: 8px;">📍 SUA LOCALIZAÇÃO</div>
        <div style="font-size: 12px;">
            <div>Lat: <span style="color: #ffa500; font-weight: bold;">${userLocation.latitude.toFixed(6)}</span></div>
            <div>Lon: <span style="color: #ffa500; font-weight: bold;">${userLocation.longitude.toFixed(6)}</span></div>
            <div>Precisão: <span style="color: #90ee90;">±${userLocation.accuracy.toFixed(0)}m</span></div>
        </div>
    `;
    
    // Adicionar distância até POIs[0] se existir
    if (typeof pois !== 'undefined' && pois.length > 0) {
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            pois[0].latitude,
            pois[0].longitude
        );
        
        const formattedDistance = formatDistance(distance);
        
        html += `
            <div style="border-top: 1px solid #667eea; margin-top: 10px; padding-top: 10px;">
                <div style="color: #ff6b6b; font-weight: bold; margin-bottom: 5px;">📌 ${pois[0].name}</div>
                <div style="font-size: 14px; font-weight: bold; color: #ff6b6b;">${formattedDistance}</div>
            </div>
        `;
        
        console.log(`📊 HUD atualizado: ${formattedDistance} até ${pois[0].name}`);
    }
    
    hudPanel.innerHTML = html;
}

// ========================================
// GPS MONITORING
// ========================================

function startGPSMonitoring() {
    console.log('🌍 Iniciando monitoramento de GPS...');
    
    if (!navigator.geolocation) {
        console.error('❌ Geolocalização não suportada neste navegador');
        hudPanel.innerHTML = '<div style="color: #ff6b6b;">❌ Geolocalização não suportada</div>';
        return;
    }
    
    // Criar painel HUD antes de começar
    if (!hudPanel) {
        createHUDPanel();
    }
    
    watchId = navigator.geolocation.watchPosition(
        function(position) {
            userLocation.latitude = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
            userLocation.accuracy = position.coords.accuracy;
            
            console.log(`📍 GPS: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)} (±${userLocation.accuracy.toFixed(0)}m)`);
            
            // Atualizar painel
            updateHUDPanel();
        },
        function(error) {
            console.warn(`⚠️  Erro de GPS: ${error.message}`);
            if (error.code === 1) {
                hudPanel.innerHTML = '<div style="color: #ff6b6b;">❌ Permissão de localização negada</div>';
            } else if (error.code === 2) {
                hudPanel.innerHTML = '<div style="color: #ffa500;">⏳ Obtendo localização...</div>';
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
    
    console.log('✅ watchPosition iniciado (ID: ' + watchId + ')');
}

function stopGPSMonitoring() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🛑 Monitoramento de GPS parado');
        watchId = null;
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
        createHUDPanel(); // Criar painel quando entra em AR
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
        
        // Remover painel HUD
        if (hudPanel && hudPanel.parentNode) {
            hudPanel.parentNode.removeChild(hudPanel);
            hudPanel = null;
        }
        
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
            const primitive = poi.modelo.geometry.primitive;
            const color = poi.modelo.material.color;
            
            const gpsEntity = document.createElement('a-gps-entity-place');
            gpsEntity.setAttribute('latitude', poi.latitude);
            gpsEntity.setAttribute('longitude', poi.longitude);
            gpsEntity.id = `poi-gps-${index}`;
            
            const entity = document.createElement('a-entity');
            entity.setAttribute('geometry', `primitive: ${primitive}`);
            entity.setAttribute('material', `color: ${color}`);
            entity.setAttribute('position', '0 0 0');
            entity.id = `poi-${index}`;
            
            entity.setAttribute('text', `value: ${poi.name}; align: center; anchor: center; side: double; color: white;`);
            
            gpsEntity.appendChild(entity);
            scene.appendChild(gpsEntity);
            
            console.log(`✅ POI ${index} (${poi.name}) criado`);
            
        } catch (error) {
            console.error(`❌ Erro ao criar POI ${index}:`, error);
        }
    });
    
    console.log(`✅ ${pois.length} POIs criados!`);
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
            console.log(`✅ POI ${index} removido`);
        }
    });
    
    console.log('✅ Todos os POIs removidos!');
}