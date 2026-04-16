// data.js - AR.js Maps Tour POIs Data
// This file exports an array of Points of Interest (POIs) for use in AR.js Maps Tour.
// Each POI object contains the following properties:
// - id: Unique identifier for the POI (number or string).
// - latitude: Latitude coordinate (number).
// - longitude: Longitude coordinate (number).
// - nome: Name of the POI (string).
// - descricao: Description of the POI (string).
// - urlModelo3D: URL to the 3D model file (GLB or GLTF format, string).
// - labelAR: Label to display in AR (string).
// - detectionRadius: Radius in meters for detection (number).

// Array of POIs
const pois = [
    {
        id: 1,
        latitude: -10.941,
        longitude: -37.072,
        nome: "São Cristóvão",
        descricao: "A charming colonial town known for its historical architecture and cultural heritage.",
        urlModelo3D: "https://example.com/sao-cristovao-model.glb", // Placeholder URL; replace with actual GLB/GLTF file
        labelAR: "São Cristóvão",
        detectionRadius: 50
    },
    {
        id: 2,
        latitude: -10.133,
        longitude: -36.833,
        nome: "Praia do Saco",
        descricao: "A beautiful beach with crystal-clear waters, ideal for relaxation and water sports.",
        urlModelo3D: "https://example.com/praia-do-saco-model.glb", // Placeholder URL; replace with actual GLB/GLTF file
        labelAR: "Praia do Saco",
        detectionRadius: 50
    },
    {
        id: 3,
        latitude: -10.947,
        longitude: -37.073,
        nome: "Marco Zero - Aracaju",
        descricao: "The zero kilometer marker in Aracaju, a symbol of the city's coastal identity.",
        urlModelo3D: "https://example.com/marco-zero-model.glb", // Placeholder URL; replace with actual GLB/GLTF file
        labelAR: "Marco Zero",
        detectionRadius: 50
    }
];

// To add a new POI, create a new object in the pois array with the required properties.
// Ensure the id is unique, coordinates are accurate, and the 3D model URL points to a valid GLB/GLTF file.
// Example:
// {
//     id: 4,
//     latitude: -10.123,
//     longitude: -37.456,
//     nome: "New Place",
//     descricao: "Description of the new place.",
//     urlModelo3D: "https://example.com/new-model.glb",
//     labelAR: "New Label",
//     detectionRadius: 50
// }

// Export the POIs array for use in other JavaScript files
module.exports = pois;