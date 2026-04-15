// ============================================
// MAPS TOUR - UTILITÁRIOS
// ============================================

/**
 * Gera um ID único para sessão
 */
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Gera um ID único para usuário
 */
function generateUserId() {
    return `user_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Formata distância em metros/km
 */
function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Calcula distância entre dois pontos GPS (Fórmula de Haversine)
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance * 1000; // Retorna em metros
}

/**
 * Log com timestamp
 */
function log(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    const styles = {
        'success': 'color: #28a745; font-weight: bold;',
        'error': 'color: #dc3545; font-weight: bold;',
        'warning': 'color: #ffc107; font-weight: bold;',
        'info': 'color: #17a2b8; font-weight: bold;'
    };
    
    console.log(`%c[${timestamp}] ${message}`, styles[type] || '');
}

/**
 * Debounce para otimização
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

/**
 * Sleep/esperar
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validar coordenadas GPS
 */
function isValidGPSCoordinate(lat, lng) {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Converter graus para radianos
 */
function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Converter radianos para graus
 */
function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Detectar suporte a geolocalização
 */
function supportsGeolocation() {
    return 'geolocation' in navigator;
}

/**
 * Detectar suporte a WebXR
 */
function supportsWebXR() {
    return 'xr' in navigator;
}