// main.js for AR.js Maps Tour
// This script integrates with data.js to load Points of Interest (POIs) and uses AR.js for augmented reality mapping.
// It employs simple 3D shapes (geometries) instead of GLTF models, leveraging geolocation for GPS positioning,
// Haversine formula for distance calculations, and dynamic entity creation in A-Frame.

// Import POIs from data.js (assuming data.js exports an array of POIs)
import { pois } from './data.js';

// Global variables
const RADIUS = 100; // Detection radius in meters
const scene = document.querySelector('a-scene');
const infoPanel = document.getElementById('info-panel');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
let userLocation = null;
let isTracking = false;
let poiEntities = [];

// Haversine formula to calculate distance between two GPS coordinates
function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return distance in meters
}

// Function to get user's current location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    resolve(userLocation);
                },
                (error) => reject(error),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}

// Function to detect POIs within the specified radius
function detectNearbyPOIs() {
    if (!userLocation) return [];
    return pois.filter(poi => {
        const distance = haversineDistance(userLocation.lat, userLocation.lng, poi.lat, poi.lng);
        return distance <= RADIUS;
    });
}

// Function to create POI models dynamically
// Instead of using gltf-model, it reads modelo.geometry.primitive and modelo.material.color from each POI
// and applies them to the a-entity
function createPOIModels(nearbyPOIs) {
    // Remove existing POI entities
    poiEntities.forEach(entity => scene.removeChild(entity));
    poiEntities = [];

    nearbyPOIs.forEach(poi => {
        // Create a new a-entity for the POI
        const entity = document.createElement('a-entity');
        
        // Set GPS positioning using gps-entity-place
        entity.setAttribute('gps-entity-place', `latitude: ${poi.lat}; longitude: ${poi.lng}`);
        
        // Apply geometry: use the primitive from poi.modelo.geometry.primitive
        if (poi.modelo && poi.modelo.geometry && poi.modelo.geometry.primitive) {
            entity.setAttribute('geometry', `primitive: ${poi.modelo.geometry.primitive}`);
        } else {
            // Default to a box if no primitive specified
            entity.setAttribute('geometry', 'primitive: box');
        }
        
        // Apply material: use the color from poi.modelo.material.color
        if (poi.modelo && poi.modelo.material && poi.modelo.material.color) {
            entity.setAttribute('material', `color: ${poi.modelo.material.color}`);
        } else {
            // Default to red if no color specified
            entity.setAttribute('material', 'color: red');
        }
        
        // Optionally add other attributes like scale, position, etc.
        entity.setAttribute('scale', '1 1 1'); // Default scale
        
        // Add event listeners for interaction (e.g., click to show info)
        entity.addEventListener('click', () => updateInfoPanel(poi));
        
        // Append to scene
        scene.appendChild(entity);
        poiEntities.push(entity);
    });
}

// Function to update the info panel with POI details
function updateInfoPanel(poi) {
    infoPanel.innerHTML = `
        <h3>${poi.name}</h3>
        <p>${poi.description}</p>
        <p>Latitude: ${poi.lat}</p>
        <p>Longitude: ${poi.lng}</p>
    `;
}

// Function to start tracking
function startTracking() {
    isTracking = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    
    // Initial location fetch and POI detection
    getUserLocation().then(() => {
        const nearbyPOIs = detectNearbyPOIs();
        createPOIModels(nearbyPOIs);
    }).catch(error => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enable GPS.');
    });
    
    // Set up interval to update location and POIs periodically
    setInterval(() => {
        if (isTracking) {
            getUserLocation().then(() => {
                const nearbyPOIs = detectNearbyPOIs();
                createPOIModels(nearbyPOIs);
            }).catch(error => console.error('Error updating location:', error));
        }
    }, 5000); // Update every 5 seconds
}

// Function to stop tracking
function stopTracking() {
    isTracking = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    // Remove all POI entities
    poiEntities.forEach(entity => scene.removeChild(entity));
    poiEntities = [];
    
    // Clear info panel
    infoPanel.innerHTML = '<p>Tracking stopped.</p>';
}

// Event listeners for buttons
startBtn.addEventListener('click', startTracking);
stopBtn.addEventListener('click', stopTracking);

// Initialize on page load
window.addEventListener('load', () => {
    // Any initial setup if needed
    console.log('AR.js Maps Tour initialized');
});