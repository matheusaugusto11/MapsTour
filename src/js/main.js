// main.js - Arquivo principal para AR.js Maps Tour

// Verificação se o array 'pois' existe no carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    if (typeof pois === 'undefined' || !Array.isArray(pois)) {
        console.error('Erro: Array pois não encontrado ou não é um array válido.');
        return;
    }
    console.log('Array pois carregado com sucesso:', pois);

    // Adiciona event listeners para os botões
    const startArBtn = document.getElementById('start-ar-btn');
    const exitBtn = document.getElementById('exit-btn');

    if (startArBtn) {
        startArBtn.addEventListener('click', function() {
            console.log('Botão start-ar-btn clicado. Iniciando AR.');
            try {
                toggleScreens('ar');
                createPOIs();
            } catch (error) {
                console.error('Erro ao iniciar AR:', error);
            }
        });
    } else {
        console.warn('Botão start-ar-btn não encontrado no DOM.');
    }

    if (exitBtn) {
        exitBtn.addEventListener('click', function() {
            console.log('Botão exit-btn clicado. Saindo do AR.');
            try {
                removePOIs();
                toggleScreens('home');
            } catch (error) {
                console.error('Erro ao sair do AR:', error);
            }
        });
    } else {
        console.warn('Botão exit-btn não encontrado no DOM.');
    }
});

// Função para criar POIs na cena AR
function createPOIs() {
    try {
        // Obtém a cena A-Frame do DOM
        const scene = document.querySelector('a-scene');
        if (!scene) {
            throw new Error('Cena A-Frame não encontrada no DOM.');
        }
        console.log('Cena A-Frame obtida:', scene);

        // Itera sobre cada POI no array pois
        pois.forEach(function(poi, index) {
            console.log(`Processando POI ${index}:`, poi);

            // Lê as propriedades do modelo
            const primitive = poi.modelo.geometry.primitive;
            const color = poi.modelo.material.color;
            console.log(`POI ${index} - Primitive: ${primitive}, Color: ${color}`);

            // Cria a entidade A-Frame
            const entity = document.createElement('a-entity');
            entity.setAttribute('geometry', `primitive: ${primitive}`);
            entity.setAttribute('material', `color: ${color}`);
            entity.setAttribute('position', '0 0 -5');
            entity.setAttribute('id', `poi-${index}`);
            console.log(`Entidade POI ${index} criada com ID poi-${index}`);

            // Adiciona à cena
            scene.appendChild(entity);
            console.log(`POI ${index} adicionado à cena.`);
        });
    } catch (error) {
        console.error('Erro na função createPOIs:', error);
    }
}

// Função para remover POIs da cena
function removePOIs() {
    try {
        // Obtém a cena A-Frame do DOM
        const scene = document.querySelector('a-scene');
        if (!scene) {
            throw new Error('Cena A-Frame não encontrada no DOM.');
        }
        console.log('Cena A-Frame obtida para remoção:', scene);

        // Itera sobre o número de POIs para remover por ID
        pois.forEach(function(poi, index) {
            const entityId = `poi-${index}`;
            const entity = document.getElementById(entityId);
            if (entity) {
                scene.removeChild(entity);
                console.log(`POI ${index} (ID: ${entityId}) removido da cena.`);
            } else {
                console.warn(`Entidade POI ${index} (ID: ${entityId}) não encontrada para remoção.`);
            }
        });
    } catch (error) {
        console.error('Erro na função removePOIs:', error);
    }
}

// Função para alternar entre telas
function toggleScreens(screen) {
    try {
        const homeScreen = document.getElementById('home-screen');
        const arScreen = document.getElementById('ar-screen');

        if (screen === 'home') {
            if (homeScreen) homeScreen.style.display = 'block';
            if (arScreen) arScreen.style.display = 'none';
            console.log('Tela alternada para home-screen.');
        } else if (screen === 'ar') {
            if (homeScreen) homeScreen.style.display = 'none';
            if (arScreen) arScreen.style.display = 'block';
            console.log('Tela alternada para ar-screen.');
        } else {
            console.warn('Parâmetro screen inválido para toggleScreens. Use "home" ou "ar".');
        }
    } catch (error) {
        console.error('Erro na função toggleScreens:', error);
    }
}