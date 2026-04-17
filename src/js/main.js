// main.js for AR.js Maps Tour
// Manages screen transitions and POI creation/removal with GPS support
// Compatible with A-Frame 1.4.2 and AR.js master

console.log('🚀 main.js carregou');

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
    
    // Detectar permissão de geolocalização
    detectGeolocationPermission();
});

// Event listener para o botão "Iniciar Tour AR"
document.getElementById('start-experience').addEventListener('click', function() {
    console.log('➤ Botão "Iniciar Tour AR" clicado');
    
    try {
        toggleScreens('ar');
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
// GEOLOCATION
// ========================================

function detectGeolocationPermission() {
    console.log('🌍 Detectando permissão de geolocalização...');
    
    if (!navigator.geolocation) {
        console.error('❌ Geolocalização não é suportada neste navegador');
        return;
    }
    
    // Tentar obter a posição atual
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const accuracy = position.coords.accuracy;
            
            console.log(`✅ Geolocalização obtida:`);
            console.log(`   - Latitude: ${lat}`);
            console.log(`   - Longitude: ${lon}`);
            console.log(`   - Precisão: ${accuracy}m`);
        },
        function(error) {
            console.warn(`⚠️  Erro ao obter geolocalização: ${error.message}`);
            console.log('   - Código de erro:', error.code);
            if (error.code === 1) {
                console.log('   - Permissão de geolocalização foi negada pelo usuário');
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
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
            
            // Adicionar label de texto (opcional)
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