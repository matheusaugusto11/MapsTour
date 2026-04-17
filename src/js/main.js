// main.js for AR.js Maps Tour - DEBUG VERSION
// Objetivo: Descobrir por que POIs não aparecem

console.log('🚀 main.js carregou');

// GLOBAL VARIABLES
let watchId = null;
let userLocation = { latitude: 0, longitude: 0, accuracy: 0 };
let hudPanel = null;

// ===== DEBUG HELPERS =====

function debugLog(message, type = 'info') {
    const colors = {
        'info': '#667eea',
        'success': '#90ee90',
        'warning': '#ffa500',
        'error': '#ff6b6b'
    };
    const emojis = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    
    console.log(`%c${emojis[type]} ${message}`, `color: ${colors[type]}; font-weight: bold; font-size: 14px;`);
}

function debugTable(data, label) {
    console.group(`📊 ${label}`);
    console.table(data);
    console.groupEnd();
}

// ===== HUD PANEL =====

function createHUDPanel() {
    debugLog('Criando painel HUD...', 'info');
    
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
    hudPanel.style.maxWidth = '300px';
    hudPanel.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.5)';
    hudPanel.style.lineHeight = '1.8';
    
    hudPanel.innerHTML = `
        <div style="color: #8b9df7; font-weight: bold; margin-bottom: 10px;">📍 DEBUG GPS</div>
        <div>Aguardando localização...</div>
    `;
    
    document.body.appendChild(hudPanel);
    debugLog('Painel HUD criado', 'success');
}

// ===== DISTANCE CALCULATION =====

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function formatDistance(distanceKm) {
    if (distanceKm < 1) {
        return `${(distanceKm * 1000).toFixed(0)} m`;
    } else {
        return `${distanceKm.toFixed(2)} km`;
    }
}

function updateHUDPanel() {
    if (!hudPanel) return;
    
    if (userLocation.latitude === 0) {
        hudPanel.innerHTML = `
            <div style="color: #8b9df7; font-weight: bold;">📍 AGUARDANDO GPS</div>
            <div style="font-size: 11px; margin-top: 8px;">Ative localização no navegador</div>
        `;
        return;
    }
    
    let html = `
        <div style="color: #8b9df7; font-weight: bold; margin-bottom: 8px;">📍 SUA LOCALIZAÇÃO</div>
        <div style="font-size: 12px;">
            <div>Lat: <span style="color: #ffa500;">${userLocation.latitude.toFixed(6)}</span></div>
            <div>Lon: <span style="color: #ffa500;">${userLocation.longitude.toFixed(6)}</span></div>
        </div>
    `;
    
    if (typeof pois !== 'undefined' && pois.length > 0) {
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            pois[0].latitude,
            pois[0].longitude
        );
        
        html += `
            <div style="border-top: 1px solid #667eea; margin-top: 10px; padding-top: 10px;">
                <div style="color: #ff6b6b; font-weight: bold;">${pois[0].name}</div>
                <div style="font-size: 14px; color: #ffa500;">${formatDistance(distance)}</div>
            </div>
        `;
    }
    
    hudPanel.innerHTML = html;
}

// ===== GPS MONITORING =====

function startGPSMonitoring() {
    debugLog('Iniciando GPS...', 'info');
    
    if (!navigator.geolocation) {
        debugLog('Geolocalização não suportada', 'error');
        return;
    }
    
    if (!hudPanel) createHUDPanel();
    
    watchId = navigator.geolocation.watchPosition(
        function(position) {
            userLocation.latitude = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
            userLocation.accuracy = position.coords.accuracy;
            
            debugLog(`GPS: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`, 'success');
            updateHUDPanel();
        },
        function(error) {
            debugLog(`Erro GPS: ${error.message}`, 'error');
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
        watchId = null;
    }
}

// ===== SCENE INSPECTION =====

function inspectScene() {
    debugLog('Inspecionando cena...', 'info');
    
    const scene = document.querySelector('a-scene');
    
    if (!scene) {
        debugLog('❌ a-scene NÃO ENCONTRADA', 'error');
        return false;
    }
    
    debugLog('✅ a-scene encontrada', 'success');
    
    const gpsCamera = scene.querySelector('a-camera[gps-camera]');
    if (gpsCamera) {
        debugLog('✅ gps-camera encontrada', 'success');
    } else {
        debugLog('❌ gps-camera NÃO ENCONTRADA', 'error');
        debugLog('Procurando por [gps-camera]...', 'warning');
    }
    
    // Listar TODOS os elementos na cena
    const entities = scene.querySelectorAll('a-entity');
    debugLog(`Total de a-entity: ${entities.length}`, 'info');
    
    const gpsEntities = scene.querySelectorAll('a-gps-entity-place');
    debugLog(`Total de a-gps-entity-place: ${gpsEntities.length}`, 'info');
    
    if (gpsEntities.length > 0) {
        gpsEntities.forEach((gps, i) => {
            const lat = gps.getAttribute('latitude');
            const lon = gps.getAttribute('longitude');
            debugLog(`  [${i}] GPS Entity: ${lat}, ${lon}`, 'info');
        });
    }
    
    return true;
}

// ===== MANUAL POI CREATION PARA TESTE =====

function createTestPOI() {
    debugLog('Criando POI de TESTE...', 'warning');
    
    const scene = document.querySelector('a-scene');
    if (!scene) {
        debugLog('Não posso criar POI - a-scene não existe', 'error');
        return;
    }
    
    // Use a localização atual + offset pequeno para teste
    const testLat = userLocation.latitude + 0.001; // ~111m de distância
    const testLon = userLocation.longitude + 0.001;
    
    debugLog(`Teste POI criado em: ${testLat}, ${testLon}`, 'info');
    
    const gpsEntity = document.createElement('a-gps-entity-place');
    gpsEntity.setAttribute('latitude', testLat);
    gpsEntity.setAttribute('longitude', testLon);
    gpsEntity.id = 'test-poi';
    
    const entity = document.createElement('a-box');
    entity.setAttribute('color', 'yellow');
    entity.setAttribute('scale', '10 10 10');
    entity.setAttribute('position', '0 0 0');
    
    gpsEntity.appendChild(entity);
    scene.appendChild(gpsEntity);
    
    debugLog('POI de teste adicionado à cena', 'success');
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    debugLog('DOMContentLoaded disparado', 'info');
    
    if (typeof pois === 'undefined') {
        debugLog('pois não está definido', 'error');
        return;
    }
    
    debugLog(`Array pois carregado: ${pois.length} POIs`, 'success');
    debugTable(pois, 'POIs Carregados');
    
    const scene = document.querySelector('a-scene');
    if (scene) {
        scene.addEventListener('loaded', function() {
            debugLog('a-scene loaded event disparado', 'success');
            inspectScene();
        });
    }
});

document.getElementById('start-experience').addEventListener('click', function() {
    debugLog('Botão "Iniciar" clicado', 'info');
    
    try {
        toggleScreens('ar');
        createHUDPanel();
        startGPSMonitoring();
        
        // Aguardar GPS estar ativo
        setTimeout(() => {
            debugLog('Criando POIs...', 'info');
            createPOIs();
            inspectScene();
            
            // Após criar POIs, test com um POI de teste muito perto
            setTimeout(() => {
                debugLog('Criando POI de teste (muito perto)', 'warning');
                createTestPOI();
                inspectScene();
            }, 2000);
        }, 3000);
        
    } catch (error) {
        debugLog(`Erro ao iniciar: ${error.message}`, 'error');
        console.error(error);
    }
});

document.getElementById('exit-ar').addEventListener('click', function() {
    debugLog('Botão "Sair" clicado', 'info');
    
    try {
        stopGPSMonitoring();
        removePOIs();
        toggleScreens('home');
        
        if (hudPanel && hudPanel.parentNode) {
            hudPanel.parentNode.removeChild(hudPanel);
            hudPanel = null;
        }
        
        debugLog('AR encerrado', 'success');
    } catch (error) {
        debugLog(`Erro ao sair: ${error.message}`, 'error');
    }
});

// ===== SCREEN MANAGEMENT =====

function toggleScreens(screen) {
    const homeScreen = document.getElementById('home-screen');
    const arScreen = document.getElementById('ar-screen');
    
    if (screen === 'ar') {
        homeScreen.style.display = 'none';
        arScreen.style.display = 'block';
        debugLog('Tela AR ativada', 'success');
    } else {
        arScreen.style.display = 'none';
        homeScreen.style.display = 'block';
        debugLog('Tela Home ativada', 'success');
    }
}

// ===== POI MANAGEMENT =====

function createPOIs() {
    debugLog('info', 'Criando POIs...');
    
    const scene = document.querySelector('a-scene');
    if (!scene) {
        debugLog('error', 'a-scene não encontrada');
        return;
    }
    
    pois.forEach((poi, index) => {
        try {
            debugLog('info', `POI ${index}: ${poi.name}`);
            
            const gpsEntity = document.createElement('a-gps-entity-place');
            gpsEntity.setAttribute('latitude', poi.latitude);
            gpsEntity.setAttribute('longitude', poi.longitude);
            gpsEntity.id = `poi-gps-${index}`;
            
            const entity = document.createElement('a-entity');
            entity.setAttribute('id', `poi-${index}`);
            entity.setAttribute('position', '0 0 0');
            entity.setAttribute('scale', '20 20 20');
            entity.setAttribute('geometry', `primitive: ${poi.modelo.geometry.primitive}`);
            entity.setAttribute('material', `color: ${poi.modelo.material.color}`);
            
            gpsEntity.appendChild(entity);
            scene.appendChild(gpsEntity);
            
            debugLog('success', `${poi.name} criado`);
            
        } catch (error) {
            debugLog('error', `POI ${index}: ${error.message}`);
        }
    });
    
    // 🆕 CRIAR SETA GUIA APÓS CRIAR OS POIs
    setTimeout(() => {
        createArrowGuide();
    }, 1000);
}

function removePOIs() {
    debugLog('Removendo POIs...', 'info');
    
    const scene = document.querySelector('a-scene');
    if (!scene) {
        debugLog('a-scene não encontrada', 'error');
        return;
    }
    
    const gpsEntities = scene.querySelectorAll('a-gps-entity-place');
    gpsEntities.forEach(entity => {
        scene.removeChild(entity);
    });
    
    debugLog(`Removidos ${gpsEntities.length} POIs`, 'success');
}

// ===== ARROW GUIDE TO POI =====

function createArrowGuide() {
    debugLog('info', 'Criando seta guia para POI[0]...');
    
    const camera = document.querySelector('a-camera[gps-camera]');
    if (!camera) {
        debugLog('error', 'Câmera GPS não encontrada');
        return;
    }
    
    // Criar entidade container da seta
    const arrow = document.createElement('a-entity');
    arrow.id = 'arrow-guide';
    arrow.setAttribute('position', '0 0 -2'); // À frente da câmera
    arrow.setAttribute('scale', '2 2 4');
    
    // Haste (cilindro)
    const shaft = document.createElement('a-cylinder');
    shaft.setAttribute('height', '1');
    shaft.setAttribute('radius', '0.1');
    shaft.setAttribute('color', 'red');
    shaft.setAttribute('position', '0 0 -0.5');
    
    // Ponta (cone)
    const tip = document.createElement('a-cone');
    tip.setAttribute('height', '0.5');
    tip.setAttribute('radius-bottom', '0.2');
    tip.setAttribute('color', 'red');
    tip.setAttribute('position', '0 0 0.5');
    
    // Adicionar componentes à seta
    arrow.appendChild(shaft);
    arrow.appendChild(tip);
    
    // Adicionar seta à câmera
    camera.appendChild(arrow);
    
    debugLog('success', 'Seta guia criada');
    
    // Registrar componente de atualização
    AFRAME.registerComponent('update-arrow', {
        tick: function() {
            if (typeof pois === 'undefined' || pois.length === 0) return;
            if (userLocation.latitude === 0) return;
            
            const poi = pois[0];
            const bearing = calculateBearing(
                userLocation.latitude,
                userLocation.longitude,
                poi.latitude,
                poi.longitude
            );
            
            // Rotacionar seta
            const arrowEntity = document.getElementById('arrow-guide');
            if (arrowEntity) {
                arrowEntity.setAttribute('rotation', `0 ${-bearing} 0`);
                
                // Calcular distância
                const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    poi.latitude,
                    poi.longitude
                );
                
                // Mudar cor baseado na distância
                const shaftEl = arrowEntity.querySelector('a-cylinder');
                const tipEl = arrowEntity.querySelector('a-cone');
                let color = 'red';
                
                if (distance < 0.1) { // Menos de 100m
                    color = 'lime';
                } else if (distance < 0.5) { // Menos de 500m
                    color = 'yellow';
                } else if (distance < 1) { // Menos de 1km
                    color = 'orange';
                } else {
                    color = 'red';
                }
                
                shaftEl.setAttribute('color', color);
                tipEl.setAttribute('color', color);
            }
        }
    });
    
    // Adicionar componente ao documento (para tick executar)
    document.body.setAttribute('update-arrow', '');
}

function calculateBearing(lat1, lon1, lat2, lon2) {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
}

// ===== FIM ARROW GUIDE =====