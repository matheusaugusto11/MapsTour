// main.js - AR.js Maps Tour with Multiple POIs
// This script handles geolocation, POI detection, and UI updates for an AR tour.
// Assumes data.js is loaded before this script, providing an array 'pois' with POI objects.
// Each POI object should have properties like: { lat: number, lng: number, name: string, info: string }

// Global variables for state management
let isTracking = false; // Boolean to track if geolocation is active
let watchId = null; // ID for the geolocation watch
let currentPosition = null; // Current user position { lat, lng }
let detectionRadius = 100; // Radius in meters to detect POIs (adjustable)
let nearestPOI = null; // The currently nearest POI

// DOM elements (assuming they exist in the HTML)
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const infoPanel = document.getElementById('infoPanel');

// Function to calculate distance using Haversine formula
// Haversine formula calculates the great-circle distance between two points on a sphere (Earth)
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180; // Convert to radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

// Function to find POIs within the detection radius and the nearest one
// Iterates over all POIs, calculates distances, and updates nearestPOI
function findNearbyPOIs() {
    if (!currentPosition) return; // No position yet

    let closestPOI = null;
    let minDistance = Infinity;
    let nearbyPOIs = []; // Array to hold POIs within radius

    pois.forEach(poi => { // pois is from data.js
        const distance = calculateDistance(currentPosition.lat, currentPosition.lng, poi.lat, poi.lng);
        if (distance <= detectionRadius) {
            nearbyPOIs.push({ ...poi, distance }); // Add distance to POI object
            if (distance < minDistance) {
                minDistance = distance;
                closestPOI = { ...poi, distance };
            }
        }
    });

    nearestPOI = closestPOI;
    console.log('Nearby POIs:', nearbyPOIs); // Debug: list nearby POIs
    console.log('Nearest POI:', nearestPOI); // Debug: nearest POI
}

// Function to update the info panel with the nearest POI's information
// If no POI is near, display a message
function updateInfoPanel() {
    if (nearestPOI) {
        infoPanel.innerHTML = `<h3>${nearestPOI.name}</h3><p>${nearestPOI.info}</p><p>Distance: ${nearestPOI.distance.toFixed(2)} meters</p>`;
    } else {
        infoPanel.innerHTML = '<p>No POIs nearby. Keep exploring!</p>';
    }
}

// Function to handle successful geolocation position update
// Updates current position, finds nearby POIs, and refreshes the panel
function onPositionUpdate(position) {
    currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    };
    console.log('Current position:', currentPosition); // Debug: current position

    findNearbyPOIs(); // Check for nearby POIs
    updateInfoPanel(); // Update the UI
}

// Function to handle geolocation errors
// Logs errors to console for debugging
function onPositionError(error) {
    console.error('Geolocation error:', error.message); // Debug: error message
}

// Function to start tracking geolocation
// Requests permission and starts watching position
function startTracking() {
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, {
            enableHighAccuracy: true, // Use high accuracy for better results
            timeout: 10000, // Timeout after 10 seconds
            maximumAge: 0 // Don't use cached positions
        });
        isTracking = true;
        console.log('Tracking started'); // Debug: tracking status
        startBtn.disabled = true;
        stopBtn.disabled = false;
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Function to stop tracking geolocation
// Clears the watch and resets state
function stopTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
    isTracking = false;
    currentPosition = null;
    nearestPOI = null;
    console.log('Tracking stopped'); // Debug: tracking status
    startBtn.disabled = false;
    stopBtn.disabled = true;
    updateInfoPanel(); // Clear the panel
}

// Event listeners for buttons
// Attach functions to button clicks
startBtn.addEventListener('click', startTracking);
stopBtn.addEventListener('click', stopTracking);

// Initialize the app
// Set initial button states
function init() {
    stopBtn.disabled = true; // Start with stop disabled
    console.log('AR.js Maps Tour initialized'); // Debug: app start
}

// Call init when the script loads
init();