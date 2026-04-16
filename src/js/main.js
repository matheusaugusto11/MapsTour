// main.js for AR.js Maps Tour
// This script assumes data.js is loaded before this file, providing an array 'pois' with POI objects.
// Each POI object should have properties like: { id, name, lat, lng, modelUrl, description }

// Global variables
const RADIUS = 100; // Radius in meters to detect nearby POIs
const scene = document.querySelector('a-scene');
const infoPanel = document.getElementById('info-panel');
const startTourBtn = document.getElementById('start-tour');
const stopTourBtn = document.getElementById('stop-tour');
let isTourActive = false;
let currentPosition = null;
let nearestPOI = null;

// Function to get current GPS position
function getCurrentPosition() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                currentPosition = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log('Current position:', currentPosition);
                updateTour();
            },
            (error) => {
                console.error('Error getting position:', error);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
    } else {
        console.error('Geolocation is not supported by this browser.');
    }
}

// Haversine formula to calculate distance between two lat/lng points in meters
function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Function to find POIs within the specified radius
function findNearbyPOIs(position, pois, radius) {
    return pois.filter(poi => haversineDistance(position.lat, position.lng, poi.lat, poi.lng) <= radius);
}

// Function to create A-Frame GLTF models for nearby POIs
// A-Frame is a web framework for building VR/AR experiences using HTML and JavaScript.
// It uses entities (like <a-entity>) to represent objects in the 3D scene.
// The <a-gltf-model> component loads and displays 3D models in GLTF format.
// GLTF (GL Transmission Format) is a standard for 3D models that includes geometry, materials, animations, etc.
// When you add <a-gltf-model src="modelUrl"> to an entity, A-Frame automatically:
// 1. Downloads the GLTF file from the src URL.
// 2. Parses the GLTF data to extract meshes, materials, and textures.
// 3. Creates Three.js objects (Three.js is the underlying 3D engine for A-Frame).
// 4. Renders the 3D model in the scene at the entity's position.
// The gps-entity-place component positions the entity in the real world based on GPS coordinates.
// It calculates the relative position from the user's current GPS location.
function createPOIModels(nearbyPOIs) {
    // Remove existing POI models
    const existingModels = scene.querySelectorAll('[poi-model]');
    existingModels.forEach(model => model.remove());

    nearbyPOIs.forEach(poi => {
        // Create a new A-Frame entity for the POI
        const entity = document.createElement('a-entity');
        entity.setAttribute('poi-model', ''); // Custom attribute for identification
        entity.setAttribute('gps-entity-place', `latitude: ${poi.lat}; longitude: ${poi.lng}`);
        entity.setAttribute('gltf-model', poi.modelUrl);
        entity.setAttribute('scale', '1 1 1'); // Default scale
        entity.setAttribute('look-at', '[camera]'); // Make it face the camera
        // Add click event to show info
        entity.addEventListener('click', () => updateInfoPanel(poi));
        scene.appendChild(entity);
        console.log('Created model for POI:', poi.name);
    });
}

// Function to update the info panel with the nearest POI
function updateInfoPanel(poi) {
    if (poi) {
        infoPanel.innerHTML = `
            <h3>${poi.name}</h3>
            <p>${poi.description}</p>
            <p>Distance: ${haversineDistance(currentPosition.lat, currentPosition.lng, poi.lat, poi.lng).toFixed(2)} m</p>
        `;
        nearestPOI = poi;
        console.log('Updated info panel for POI:', poi.name);
    } else {
        infoPanel.innerHTML = '<p>No nearby POIs</p>';
    }
}

// Function to find the nearest POI
function findNearestPOI(position, pois) {
    if (!pois.length) return null;
    let nearest = pois[0];
    let minDistance = haversineDistance(position.lat, position.lng, nearest.lat, nearest.lng);
    pois.forEach(poi => {
        const dist = haversineDistance(position.lat, position.lng, poi.lat, poi.lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearest = poi;
        }
    });
    return nearest;
}

// Main update function called when position changes
function updateTour() {
    if (!isTourActive || !currentPosition) return;

    const nearbyPOIs = findNearbyPOIs(currentPosition, pois, RADIUS);
    createPOIModels(nearbyPOIs);

    const nearest = findNearestPOI(currentPosition, nearbyPOIs);
    updateInfoPanel(nearest);
}

// Event listeners for buttons
function startTour() {
    isTourActive = true;
    startTourBtn.disabled = true;
    stopTourBtn.disabled = false;
    getCurrentPosition();
    console.log('Tour started');
}

function stopTour() {
    isTourActive = false;
    startTourBtn.disabled = false;
    stopTourBtn.disabled = true;
    // Remove all POI models
    const models = scene.querySelectorAll('[poi-model]');
    models.forEach(model => model.remove());
    infoPanel.innerHTML = '<p>Tour stopped</p>';
    console.log('Tour stopped');
}

// Initialize event listeners
startTourBtn.addEventListener('click', startTour);
stopTourBtn.addEventListener('click', stopTour);

// Initial setup
console.log('AR.js Maps Tour initialized');
