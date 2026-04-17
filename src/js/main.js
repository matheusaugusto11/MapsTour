// main.js for AR.js Maps Tour
// VERSÃO CORRIGIDA: POIs com GPS funcionando
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
    
    if (hudPanel && hudPanel.parentNode) {
        hudPanel.parentNode.removeChild(hudPanel);
    }
    
    hudPanel = document.createElement('div');
    hudPanel.id = 'gps-display';
    
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
    
    hudPanel.innerHTML = `
        <div style="color: #8b9df7; font-weight: bold; margin-bottom: 10px;">📍 LOCALIZANDO...</div>
        <div>Aguardando GPS...</div>
    `;
    
    document.body.appendChild(hudPanel);
    
    console.log('✅ Painel HUD criado com sucesso');
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
    const distance = R * c;
    
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
    if (!hudPanel) return;
    
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
        return;
    }
    
    if (!hudPanel) {
        createHUDPanel();
    }
    
    watchId = navigator.geolocation.watchPosition(
        function(position) {
            userLocation.latitude = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
            userLocation.accuracy = position.coords.accuracy;
            
            console.log(`📍 GPS: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)} (±${userLocation.accuracy.toFixed(0)}m)`);
            
            updateHUDPanel();
        },
        function(error) {
            console.warn(`⚠️  Erro de GPS: ${error.message}`);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
    
    console.log('✅ GPS monitoring started');
}

function stopGPSMonitoring() {
    if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        console.log('🛑 GPS monitoring stopped');
        watchId = null;
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📡 DOMContentLoaded: Inicializando aplicação');
    
    if (typeof pois === 'undefined') {
        console.error('❌ ERRO: pois não está definido');
        return;
    }
    
    console.log('✅ Array pois carregado:', pois.length, 'POIs');
    
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', function() {
            console.log('✅ a-scene carregada');
        });
    }
});

document.getElementById('start-experience').addEventListener('click', function() {
    console.log('➤ Botão "Iniciar Tour AR" clicado');
    
    try {
        toggleScreens('ar');
        createHUDPanel();
        startGPSMonitoring();
        createPOIs();
        console.log('✅ AR iniciado');
    } catch (error) {
        console.error('❌ Erro ao iniciar AR:', error);
    }
});

document.getElementById('exit-ar').addEventListener('click', function() {
    console.log('➤ Botão "Sair" clicado');
    
    try {
        stopGPSMonitoring();
        removePOIs();
        toggleScreens('home');
        
        if (hudPanel && hudPanel.parentNode) {
            hudPanel.parentNode.removeChild(hudPanel);
            hudPanel = null;
        }
        
        console.log('✅ AR encerrado');
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
// POI MANAGEMENT - VERSÃO CORRIGIDA
// ========================================

function createPOIs() {
    console.log('📍 Criando POIs com GPS...');
    console.log('🔍 Procurando a-scene...');
    
    const scene = document.querySelector('a-scene');
    
    if (!scene) {
        console.error('❌ a-scene não encontrada!');
        return;
    }
    
    console.log('✅ a-scene encontrada');
    
    pois.forEach((poi, index) => {
        try {
            console.log(`\n📌 Criando POI ${index + 1}: ${poi.name}`);
            console.log(`   Coordenadas: ${poi.latitude}, ${poi.longitude}`);
            
            // ✅ CORREÇÃO PRINCIPAL: Usar setAttribute com atributos SEPARADOS
            const gpsEntity = document.createElement('a-gps-entity-place');
            
            // Adicionar atributos separados (NÃO em uma string única)
            gpsEntity.setAttribute('latitude', poi.latitude);
            gpsEntity.setAttribute('longitude', poi.longitude);
            gpsEntity.id = `poi-gps-${index}`;
            
            console.log(`   ✅ a-gps-entity-place criada`);
            console.log(`   - latitude: ${poi.latitude}`);
            console.log(`   - longitude: ${poi.longitude}`);
            
            // Criar entidade 3D DENTRO da GPS entity
            const entity = document.createElement('a-entity');
            entity.setAttribute('id', `poi-${index}`);
            entity.setAttribute('position', '0 0 0');
            entity.setAttribute('scale', '20 20 20');
            entity.setAttribute('rotation', '0 0 0');
            entity.setAttribute('geometry', `primitive: ${poi.modelo.geometry.primitive}`);
            entity.setAttribute('material', `color: ${poi.modelo.material.color}`);
            
            console.log(`   ✅ a-entity criada`);
            console.log(`   - geometry: ${poi.modelo.geometry.primitive}`);
            console.log(`   - material color: ${poi.modelo.material.color}`);
            console.log(`   - scale: 20 20 20`);
            console.log(`   - position: 0 0 0`);
            
            // Adicionar texto (label)
            entity.setAttribute('text', `value: ${poi.name}; align: center; anchor: center; side: double; color: white; width: 100;`);
            
            // ✅ CRITICAL: Adicionar entity DENTRO da gps-entity-place
            gpsEntity.appendChild(entity);
            
            console.log(`   ✅ a-entity adicionada dentro da a-gps-entity-place`);
            
            // Adicionar à cena
            scene.appendChild(gpsEntity);
            
            console.log(`   ✅ a-gps-entity-place adicionada à cena`);
            
            // Verificar distância
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                poi.latitude,
                poi.longitude
            );
            
            console.log(`   📏 Distância até POI: ${formatDistance(distance)}`);
            
            if (distance > 5) {
                console.warn(`   ⚠️  POI está a ${formatDistance(distance)} - pode não aparecer se estiver muito longe`);
            }
            
            console.log(`✅ POI ${index + 1} criado com SUCESSO\n`);
            
        } catch (error) {
            console.error(`❌ Erro ao criar POI ${index}:`, error);
        }
    });
    
    console.log(`\n🎉 ${pois.length} POIs criados com GPS!`);
}

function removePOIs() {
    console.log('🗑️  Removendo POIs...');
    
    const scene = document.querySelector('a-scene');
    
    if (!scene) {
        console.error('❌ a-scene não encontrada');
        return;
    }
    
    // Remover todas as a-gps-entity-place
    const gpsEntities = scene.querySelectorAll('a-gps-entity-place');
    
    console.log(`🔍 Encontradas ${gpsEntities.length} a-gps-entity-place`);
    
    gpsEntities.forEach((entity, index) => {
        scene.removeChild(entity);
        console.log(`✅ POI ${index + 1} removido`);
    });
    
    console.log('✅ Todos os POIs removidos!');
}