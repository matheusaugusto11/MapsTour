// This file defines a global array 'pois' for AR.js Maps Tour.
// It contains 3 Points of Interest (POIs) in Sergipe, Brazil with CORRECT GPS coordinates.
// Each POI has latitude, longitude, name, description, and a model with geometry and material.

const pois = [
    {
    latitude: -10.9452,
    longitude: -37.0941,
    name: "Casa",
    description: "A historic cathedral in the capital city of Sergipe, Brazil.",
    modelo: {
      geometry: { primitive: 'box' },
      material: { color: 'blue' }
    }
  },
  {
    latitude: -10.9145,
    longitude: -39.0708,
    name: "Aracaju Cathedral",
    description: "A historic cathedral in the capital city of Sergipe, Brazil.",
    modelo: {
      geometry: { primitive: 'box' },
      material: { color: 'blue' }
    }
  },
  {
    latitude: -10.9510,
    longitude: -37.0715,
    name: "Praia do Saco",
    description: "A beautiful beach located near Aracaju, known for its natural beauty and pristine waters.",
    modelo: {
      geometry: { primitive: 'sphere' },
      material: { color: 'green' }
    }
  },
  {
    latitude: -10.2619,
    longitude: -38.1700,
    name: "Serra de Itabaiana National Park",
    description: "A national park in Sergipe featuring diverse flora and fauna in the Atlantic Forest region.",
    modelo: {
      geometry: { primitive: 'cylinder' },
      material: { color: 'red' }
    }
  }
];