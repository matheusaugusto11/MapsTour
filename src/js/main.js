// main.js for AR.js Maps Tour - FINAL VERSION
// Sem painéis duplicados + Seta 3D guia

console.log('🚀 main.js carregou');

// ===== GLOBAL VARIABLES =====

let watchId = null;
let userLocation = { latitude: 0, longitude: 0, accuracy: 0 };
let hudPanel = null;
let logPanel = null;
let arrowEntity = null;
let arrowAnimationId = null;
let logs = [];
const MAX_LOGS = 15;
const IS_MOBILE = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ===== CLEANUP FUNCTION =====

function cleanupAllPanels() {
    // Remover TODOS os painéis antigos
    const oldHUDs = document.querySelectorAll('#gps-display, #hud-panel, [gps-hud]');
    oldHUDs.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    const oldLogs = document.querySelectorAll('#log-panel, [log-panel]');
    oldLogs.forEach(el => {
        if (el.parentNode) el.parentNode.removeChild(el);
    });
    
    hudPanel = null;
    logPanel = null;
}

// ===== DEBUG LOGGING =====

function debugLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
        'info': '#667eea',
        'success': '#90ee90',
        'warning': '#ffa500',
        'error': '#ff6b6b'
    };
    
    console.log(`%c[${timestamp}] ${message}`, `color: ${colors[type]}; font-weight: bold;`);
    
    if (IS_MOBILE && logPanel) {
        const logEntry = { type, message, timestamp };
        logs.push(logEntry);
        if (logs.length > MAX_LOGS) logs.shift();
        updateLogPanel();
    }
}

function createLogPanel() {
    if (!IS_MOBILE) return;
    
    logPanel = document.createElement('div');
    logPanel.id = 'log-panel';
    
    logPanel.style.position = 'fixed';
    logPanel.style.top = '20px';
    logPanel.style.right = '20px';
    logPanel.style.width = '280px';
    logPanel.style.maxHeight = '500px';
    logPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    logPanel.style.border = '2px solid #667eea';
    logPanel.style.color = 'white';
    logPanel.style.fontSize = '12px';
    logPanel.style.padding = '10px';
    logPanel.style.borderRadius = '8px';
    logPanel.style.fontFamily = '"Courier New", monospace';
    logPanel.style.zIndex = '9998';
    logPanel.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.8)';
    
    const clearButton = document.createElement('button');
    clearButton.textContent = '🗑️ Limpar';
    clearButton.style.width = '100%';
    clearButton.style.marginBottom = '8px';
    clearButton.style.padding = '5px';
    clearButton.style.backgroundColor = '#667eea';
    clearButton.style.color = 'white';
    clearButton.style.border = 'none';
    clearButton.style.borderRadius = '4px';
    clearButton.style.cursor = 'pointer';
    clearButton.style.fontSize = '12px';
    clearButton.onclick = () => {
        logs = [];
        updateLogPanel();
    };
    logPanel.appendChild(clearButton);
    
    const logContainer = document.createElement('div');
    logContainer.className = 'log-container';
    logContainer.style.maxHeight = '420px';
    logContainer.style.overflowY = 'auto';
    logContainer.style.lineHeight = '1.4';
    logPanel.appendChild(logContainer);
    
    document.body.appendChild(logPanel);
}

function updateLogPanel() {
    if (!logPanel) return;
    
    const logContainer = logPanel.querySelector('.log-container');
    const colors = {
        'info': '#667eea',
        'success': '#90ee90',
        'warning': '#ffa500',
        'error': '#ff6b6b'
    };
    
    logContainer.innerHTML = logs.map(log => 
        `<div style="color: ${colors[log.type]}; margin-bottom: 4px;"><span style="font-size: 10px; color: #888;">[${log.timestamp}]</span> ${log.message}</div>`
    ).join('');
    
    logContainer.scrollTop = logContainer.scrollHeight;
}

// ===== HUD PANEL =====

function createHUDPanel() {
    cleanupAllPanels(); // Limpar painéis antigos PRIMEIRO
    
    debugLog('info', 'Criando painel HUD...');
    
    hudPanel = document.createElement('div');
    hudPanel.id = 'gps-display';
    
    hudPanel.style.position = 'fixed';
    hudPanel.style.top = IS_MOBILE ? '20px' : '80px';
    hudPanel.style.left = '20px';
    hudPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    hudPanel.style.color = '#ffffff';
    hudPanel.style.padding = '15px';
    hudPanel.style.borderRadius = '8px';
    hudPanel.style.fontSize = IS_MOBILE ? '11px' : '13px';
    hudPanel.style.fontFamily = '"Courier New", monospace';
    hudPanel.style.zIndex = '9999';
    hudPanel.style.pointerEvents = 'none';
    hudPanel.style.border = '2px solid #667eea';
    hudPanel.style.maxWidth = IS_MOBILE ? '250px' : '300px';
    hudPanel.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.5)';
    hudPanel.style.lineHeight = '1.8';
    
    hudPanel.innerHTML = `
        <div style="color: #8b9df7; font-weight: bold; margin-bottom: 10px;">📍 LOCALIZANDO...</div>
        <div>Aguardando GPS...</div>
    `;
    
    document.body.appendChild(hudPanel);
    debugLog('success', 'Painel HUD criado');
}

// ===== DISTANCE & BEARING =====

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
            <div style="font-size: 10px; margin-top: 8px;">Ative localização</div>
        `;
        return;
    }
    
    let html = `
        <div style="color: #8b9df7; font-weight: bold; margin-bottom: 8px;">📍 LOCALIZAÇÃO</div>
        <div style="font-size: 11px;">
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
                <div style="color: #ff6b6b; font-weight: bold; font-size: 11px;">📌 ${pois[0].name}</div>
                <div style="font-size: 12px; color: #ffa500; font-weight: bold;">${formatDistance(distance)}</div>
            </div>
        `;
    }
    
    hudPanel.innerHTML = html;
}

// ===== SETA 3D GUIA =====

function createArrow() {
    debugLog('info', 'Criando seta guia...');
    
    const camera = document.querySelector('a-camera[gps-camera]');
    if (!camera) {
        debugLog('error', 'Câmera GPS não encontrada');
        return;
    }
    
    // Remover seta antiga se existir
    const oldArrow = document.getElementById('arrow-guide');
    if (oldArrow && oldArrow.parentNode) {
        oldArrow.parentNode.removeChild(oldArrow);
    }
    
    // Container da seta
    arrowEntity = document.createElement('a-entity');
    arrowEntity.id = 'arrow-guide';
    arrowEntity.setAttribute('position', '0 0 -1');
    arrowEntity.setAttribute('scale', '0.5 0.5 0.5');
    
    // Haste (cilindro)
    const shaft = document.createElement('a-cylinder');
    shaft.setAttribute('height', '1');
    shaft.setAttribute('radius', '0.1');
    shaft.setAttribute('color', 'red');
    shaft.setAttribute('position', '0 -0.3 0');
    shaft.id = 'arrow-shaft';
    
    // Ponta (cone)
    const tip = document.createElement('a-cone');
    tip.setAttribute('height', '0.4');
    tip.setAttribute('radius-bottom', '0.2');
    tip.setAttribute('color', 'red');
    tip.setAttribute('position', '0 0.3 0');
    tip.id = 'arrow-tip';
    
    arrowEntity.appendChild(shaft);
    arrowEntity.appendChild(tip);
    camera.appendChild(arrowEntity);
    
    debugLog('success', 'Seta criada');
    
    // Iniciar atualização contínua da seta
    updateArrow();
}

function updateArrow() {
    if (!arrowEntity || typeof pois === 'undefined' || pois.length === 0) {
        arrowAnimationId = requestAnimationFrame(updateArrow);
        return;
    }
    
    if (userLocation.latitude === 0) {
        arrowAnimationId = requestAnimationFrame(updateArrow);
        return;
    }
    
    const poi = pois[0];
    const bearing = calculateBearing(
        userLocation.latitude,
        userLocation.longitude,
        poi.latitude,
        poi.longitude
    );
    
    const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        poi.latitude,
        poi.longitude
    );
    
    // Rotacionar seta
    arrowEntity.setAttribute('rotation', `0 ${-bearing} 0`);
    
    // Mudar cor baseado em distância
    let color = 'red';
    if (distance < 0.1) {
        color = 'lime';
    } else if (distance < 0.5) {
        color = 'yellow';
    } else if (distance < 1) {
        color = 'orange';
    }
    
    const shaft = document.getElementById('arrow-shaft');
    const tip = document.getElementById('arrow-tip');
    
    if (shaft) shaft.setAttribute('color', color);
    if (tip) tip.setAttribute('color', color);
    
    arrowAnimationId = requestAnimationFrame(updateArrow);
}

// ===== GPS MONITORING =====

function startGPSMonitoring() {
    debugLog('info', 'Iniciando GPS...');
    
    if (!navigator.geolocation) {
        debugLog('error', 'Geolocalização não suportada');
        return;
    }
    
    watchId = navigator.geolocation.watchPosition(
        function(position) {
            userLocation.latitude = position.coords.latitude;
            userLocation.longitude = position.coords.longitude;
            userLocation.accuracy = position.coords.accuracy;
            
            debugLog('success', `GPS: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`);
            updateHUDPanel();
        },
        function(error) {
            debugLog('error', `Erro GPS: ${error.message}`);
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
        debugLog('info', 'GPS parado');
        watchId = null;
    }
}

// ===== EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    debugLog('info', 'DOMContentLoaded');
    
    if (IS_MOBILE) {
        createLogPanel();
    }
    
    if (typeof pois === 'undefined') {
        debugLog('error', 'pois não definido');
        return;
    }
    
    debugLog('success', `${pois.length} POIs carregados`);
});

document.getElementById('start-experience').addEventListener('click', function() {
    debugLog('info', 'Iniciar AR');
    
    try {
        toggleScreens('ar');
        createHUDPanel();
        startGPSMonitoring();
        createPOIs();
        
        // Criar seta após 1 segundo
        setTimeout(() => {
            createArrow();
        }, 1000);
        
        debugLog('success', 'AR iniciado');
    } catch (error) {
        debugLog('error', `Erro: ${error.message}`);
    }
});

document.getElementById('exit-ar').addEventListener('click', function() {
    debugLog('info', 'Sair');
    
    try {
        // Parar atualização da seta
        if (arrowAnimationId) {
            cancelAnimationFrame(arrowAnimationId);
            arrowAnimationId = null;
        }
        
        // Remover seta
        if (arrowEntity && arrowEntity.parentNode) {
            arrowEntity.parentNode.removeChild(arrowEntity);
            arrowEntity = null;
        }
        
        stopGPSMonitoring();
        removePOIs();
        toggleScreens('home');
        cleanupAllPanels();
        
        debugLog('success', 'AR encerrado');
    } catch (error) {
        debugLog('error', `Erro ao sair: ${error.message}`);
    }
});

// ===== SCREEN MANAGEMENT =====

function toggleScreens(screen) {
    const homeScreen = document.getElementById('home-screen');
    const arScreen = document.getElementById('ar-screen');
    
    if (screen === 'ar') {
        homeScreen.style.display = 'none';
        arScreen.style.display = 'block';
        debugLog('success', 'AR screen ativada');
    } else {
        arScreen.style.display = 'none';
        homeScreen.style.display = 'block';
        debugLog('success', 'Home screen ativada');
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
}

function removePOIs() {
    debugLog('info', 'Removendo POIs...');
    
    const scene = document.querySelector('a-scene');
    if (!scene) return;
    
    const gpsEntities = scene.querySelectorAll('a-gps-entity-place');
    gpsEntities.forEach(entity => {
        scene.removeChild(entity);
    });
    
    debugLog('success', `${gpsEntities.length} POIs removidos`);
}

// ===== ARROW TEST (ADICIONE NO FINAL DO ARQUIVO) =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('\n🔍 === INICIANDO TESTE DE SETA ===\n');
    
    // Aguardar scene carregar
    setTimeout(function() {
        const scene = document.querySelector('a-scene');
        if (!scene) {
            console.error('❌ a-scene não encontrada');
            return;
        }
        console.log('✅ a-scene encontrada');
        
        const camera = document.querySelector('a-camera[gps-camera]');
        if (!camera) {
            console.error('❌ a-camera[gps-camera] não encontrada');
            const anyCamera = document.querySelector('a-camera');
            if (anyCamera) {
                console.log('⚠️  Encontrada a-camera mas SEM gps-camera');
                console.log('   Tentando adicionar seta mesmo assim...');
            }
            return;
        }
        console.log('✅ a-camera[gps-camera] encontrada');
        
        // Criar BOX de teste SIMPLES
        console.log('✅ Criando BOX de teste...');
        const testBox = document.createElement('a-box');
        testBox.setAttribute('color', 'red');
        testBox.setAttribute('position', '0 0 -2');
        testBox.setAttribute('scale', '0.5 0.5 1');
        testBox.id = 'test-arrow';
        
        // Adicionar à camera
        camera.appendChild(testBox);
        console.log('✅ BOX adicionado à camera');
        console.log('   - ID: test-arrow');
        console.log('   - Posição: 0 0 -2');
        console.log('   - Cor: red');
        console.log('   - Pai: a-camera[gps-camera]');
        
        // Verificar se foi adicionado
        setTimeout(function() {
            const added = document.getElementById('test-arrow');
            if (added) {
                console.log('✅ BOX está no DOM');
                console.log('   Ele DEVE estar visível na câmera agora!');
            } else {
                console.error('❌ BOX não foi adicionado ao DOM');
            }
        }, 500);
        
    }, 2000); // Esperar 2 segundos para scene carregar
});

// ===== FIM ARROW TEST =====

// Teste Ultra Simples: Criar Primitiva Vermelha na Câmera

document.addEventListener('DOMContentLoaded', function() {
    // Aguardar scene carregar completamente
    setTimeout(() => {
        console.log('🧪 Iniciando teste de primitiva...');
        
        const scene = document.querySelector('a-scene');
        const camera = document.querySelector('a-camera[gps-camera]');
        
        if (!scene) {
            console.error('❌ ERRO: a-scene não encontrada');
            return;
        }
        
        if (!camera) {
            console.error('❌ ERRO: a-camera[gps-camera] não encontrada');
            return;
        }
        
        console.log('✅ Scene e Camera encontradas');
        
        // Criar primitiva simples (a-box)
        const testBox = document.createElement('a-box');
        testBox.setAttribute('position', '0 0 -1.5');
        testBox.setAttribute('color', 'red');
        testBox.setAttribute('scale', '0.3 0.3 0.3');
        testBox.id = 'teste-primitiva';
        
        // Adicionar diretamente na camera
        camera.appendChild(testBox);
        
        console.log('✅ Box criado e adicionado à camera');
        console.log('   Position: 0 0 -1.5');
        console.log('   Color: red');
        console.log('   Scale: 0.3 0.3 0.3');
        console.log('\n🎯 Você deve ver um CUBO VERMELHO na sua frente!');
        
    }, 2000); // Esperar 2 segundos para a-scene carregar
});