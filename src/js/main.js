// main.js for AR.js Maps Tour
// Simple test to check if everything loads

// On page load, log messages
window.onload = function() {
  console.log('main.js carregou');
  console.log('pois carregou com ' + pois.length + ' items');
};

// Get the start button and add click event listener
document.getElementById('start-btn').addEventListener('click', function() {
  console.log('Botão start-btn clicado');
  
  // Create a simple entity with box geometry and red material
  var entity = document.createElement('a-entity');
  entity.setAttribute('geometry', 'primitive: box');
  entity.setAttribute('material', 'color: red');
  entity.setAttribute('position', '0 0 -5');
  console.log('Entidade criada com geometria box, material vermelho, posição 0 0 -5');
  
  // Append the entity to the a-scene
  var scene = document.querySelector('a-scene');
  scene.appendChild(entity);
  console.log('Entidade anexada à a-scene');
});