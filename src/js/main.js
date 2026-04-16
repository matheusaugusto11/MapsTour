// main.js - Simple AR.js Maps Tour script
// This script assumes data.js is loaded before this file, defining a 'pois' array of points of interest with lat and lon properties.

// Wait for the page to load completely
window.addEventListener('load', function() {
    // Log that main.js has loaded
    console.log('main.js carregou');
    
    // Test if pois array exists and log the number of POIs
    if (typeof pois !== 'undefined') {
        console.log('pois array exists with', pois.length, 'POIs');
    } else {
        console.log('pois array does not exist');
    }
    
    // Get the start button element
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        // Add event listener for start button click
        startBtn.addEventListener('click', function() {
            // Log that start was clicked
            console.log('Start foi clicado');
            
            // Simulate a location (e.g., New York City coordinates)
            const userLat = 40.7128;
            const userLon = -74.0060;
            console.log('Simulated user location:', userLat, userLon);
            
            // Assume first POI for distance calculation
            if (pois && pois.length > 0) {
                const poi = pois[0];
                console.log('Calculating distance to first POI:', poi);
                
                // Haversine formula to calculate distance in kilometers
                const R = 6371; // Earth's radius in km
                const dLat = (poi.lat - userLat) * Math.PI / 180;
                const dLon = (poi.lon - userLon) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(userLat * Math.PI / 180) * Math.cos(poi.lat * Math.PI / 180) *
                          Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distance = R * c;
                console.log('Calculated distance:', distance, 'km');
            } else {
                console.log('No POIs available for distance calculation');
            }
            
            // Get the a-scene element
            const scene = document.querySelector('a-scene');
            if (scene) {
                // Create a simple a-entity with geometry (box) and material (red color)
                const entity = document.createElement('a-entity');
                entity.setAttribute('geometry', 'primitive: box; width: 1; height: 1; depth: 1');
                entity.setAttribute('material', 'color: red');
                entity.setAttribute('position', '0 0 -5'); // Position it in front
                console.log('Created a-entity:', entity);
                
                // Append the entity to the a-scene
                scene.appendChild(entity);
                console.log('Appended entity to a-scene');
            } else {
                console.log('a-scene not found');
            }
        });
    } else {
        console.log('start-btn not found');
    }
});