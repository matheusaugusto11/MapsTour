// main.js for AR.js Maps Tour
// Manages screen transitions and POI creation/removal

console.log('main.js carregou');
console.log('Número de POIs:', pois.length);

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: Inicializando aplicação');
    
    // Verificar se pois existe
    if (typeof pois === 'undefined') {
        console.error('ERRO: pois não está definido. Certifique-se de que data.js foi carregado.');
        return;
    }
    
    console.log('✅ Array pois carregado com sucesso:', pois.length, 'POIs');
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
    console.log(`📡 Alternando para tela: ${screen}`);
    
    const homeScreen = document.getElementById('home-screen');
    const arScreen = document.getElementById('ar-screen');
    
    if (screen === 'ar') {
        homeScreen.classList.remove('active');
        arScreen.classList.add('active');
        console.log('🎬 Tela AR ativada');
    } else if (screen === 'home') {
        arScreen.classList.remove('active');
        homeScreen.classList.add('active');
        console.log('🏠 Tela Home ativada');
    }
}

// ========================================
// POI MANAGEMENT
// ========================================

function createPOIs() {
    console.log('📍 Criando POIs...');
    
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
            
            // Criar entidade
            const entity = document.createElement('a-entity');
            entity.setAttribute('geometry', `primitive: ${primitive}`);
            entity.setAttribute('material', `color: ${color}`);
            entity.setAttribute('position', '0 0 -5');
            entity.id = `poi-${index}`;
            
            // Adicionar à cena
            scene.appendChild(entity);
            
            console.log(`✅ POI ${index} (${poi.name}) criado:`);
            console.log(`   - Geometria: ${primitive}`);
            console.log(`   - Cor: ${color}`);
            console.log(`   - Posição: 0 0 -5`);
            
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
        const entity = document.getElementById(`poi-${index}`);
        
        if (entity) {
            scene.removeChild(entity);
            console.log(`✅ POI ${index} (${poi.name}) removido`);
        } else {
            console.warn(`⚠️  POI ${index} (${poi.name}) não encontrado para remover`);
        }
    });
    
    console.log(`✅ Todos os POIs foram removidos com sucesso!`);
}