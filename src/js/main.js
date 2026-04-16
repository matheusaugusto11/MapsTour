// main.js for AR.js Maps Tour
// Assumes data.js provides a global 'pois' array

// On page load, log loading message and number of POIs
document.addEventListener('DOMContentLoaded', function() {
    console.log('main.js carregou');
    console.log('Número de POIs:', pois.length);
});

// Event listener for start experience button
document.getElementById('start-experience').addEventListener('click', function() {
    console.log('Botão #start-experience clicado');
    // Hide home-screen and show ar-screen
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('ar-screen').style.display = 'block';
    // Call createPOIs
    createPOIs();
});

// Event listener for exit AR button
document.getElementById('exit-ar').addEventListener('click', function() {
    console.log('Botão #exit-ar clicado');
    // Show home-screen and hide ar-screen
    document.getElementById('home-screen').style.display = 'block';
    document.getElementById('ar-screen').style.display = 'none';
    // Call removePOIs
    removePOIs();
});

// Function to create POIs
function createPOIs() {
    console.log('Criando POIs');
    const scene = document.querySelector('a-scene');
    pois.forEach((poi, index) => {
        // Read geometry primitive and material color
        const primitive = poi.modelo.geometry.primitive;
        const color = poi.modelo.material.color;
        // Create a-entity
        const entity = document.createElement('a-entity');
        entity.setAttribute('geometry', `primitive: ${primitive}`);
        entity.setAttribute('material', `color: ${color}`);
        entity.setAttribute('position', '0 0 -5');
        entity.id = `poi-${index}`;
        // Append to scene
        scene.appendChild(entity);
        console.log(`POI ${index} criado com ID poi-${index}`);
    });
}

// Function to remove POIs
function removePOIs() {
    console.log('Removendo POIs');
    const scene = document.querySelector('a-scene');
    pois.forEach((poi, index) => {
        const entity = document.getElementById(`poi-${index}`);
        if (entity) {
            scene.removeChild(entity);
            console.log(`POI ${index} removido`);
        }
    });
}