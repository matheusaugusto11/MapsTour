// data.js - Data file for AR.js Maps Tour prototyping
// This file defines Points of Interest (POIs) for Sergipe, Brazil.
// Each POI includes location data (latitude, longitude), name, description,
// and a 'modelo' object for simple 3D shapes using A-Frame primitives.
// Instead of modelUrl, we use geometry (primitive), material (color), and scale.

// Array of POIs - easily scalable by adding more objects
const pois = [
  {
    // POI 1: São Cristóvão - Cube (box primitive)
    latitude: -10.9211,
    longitude: -37.1033,
    name: "São Cristóvão",
    description: "A historic city in Sergipe, known for its colonial architecture.",
    modelo: {
      geometry: {
        primitive: "box"  // Cube shape
      },
      material: {
        color: "red"  // Red color
      },
      scale: "1 1 1"  // Default scale
    }
  },
  {
    // POI 2: Aracaju - Sphere
    latitude: -10.9472,
    longitude: -37.0731,
    name: "Aracaju",
    description: "The capital of Sergipe, featuring beautiful beaches and urban attractions.",
    modelo: {
      geometry: {
        primitive: "sphere"  // Sphere shape
      },
      material: {
        color: "blue"  // Blue color
      },
      scale: "1 1 1"  // Default scale
    }
  },
  {
    // POI 3: Laranjeiras - Cylinder
    latitude: -10.8044,
    longitude: -37.1683,
    name: "Laranjeiras",
    description: "A municipality in Sergipe with rich cultural heritage.",
    modelo: {
      geometry: {
        primitive: "cylinder"  // Cylinder shape
      },
      material: {
        color: "green"  // Green color
      },
      scale: "1 1 1"  // Default scale
    }
  }
];

// Export the pois array for use in other modules
// In a browser environment, you can access it directly or use a module system
export default pois;
