// This file defines a global array 'pois' for AR.js Maps Tour.
// It contains 3 Points of Interest (POIs) in Sergipe, Brazil.
// Each POI has latitude, longitude, name, description, and a model with geometry and material.
// The array is declared with 'const' and is accessible from the global scope.

const pois = [
  {
    latitude: -10.911,
    longitude: -37.071,
    name: "Aracaju Cathedral",
    description: "A historic cathedral in the capital city of Sergipe.",
    modelo: {
      geometry: { primitive: 'box' },
      material: { color: 'blue' }
    }
  },
  {
    latitude: -10.95,
    longitude: -37.07,
    name: "Praia do Saco",
    description: "A beautiful beach in Sergipe known for its natural beauty.",
    modelo: {
      geometry: { primitive: 'sphere' },
      material: { color: 'green' }
    }
  },
  {
    latitude: -10.68,
    longitude: -37.42,
    name: "Serra de Itabaiana National Park",
    description: "A national park in Sergipe with diverse flora and fauna.",
    modelo: {
      geometry: { primitive: 'cylinder' },
      material: { color: 'red' }
    }
  }
];