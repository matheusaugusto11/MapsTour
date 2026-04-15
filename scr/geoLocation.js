// ============================================
// MAPS TOUR - GEOLOCALIZAÇÃO
// ============================================

class GeoLocationManager {
    constructor() {
        this.currentPosition = null;
        this.watchId = null;
        this.listeners = [];
        this.isSupported = supportsGeolocation();
    }

    /**
     * Inicia monitoramento contínuo de GPS
     */
    async startWatching() {
        return new Promise((resolve, reject) => {
            if (!this.isSupported) {
                reject(new Error('Geolocalização não suportada neste navegador'));
                return;
            }

            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    this.currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude || 0,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };

                    log('success', `📍 GPS: ${this.currentPosition.latitude.toFixed(4)}, ${this.currentPosition.longitude.toFixed(4)}`);

                    // Notifica listeners
                    this.listeners.forEach(callback => callback(this.currentPosition));
                },
                (error) => {
                    log('error', `❌ Erro de geolocalização: ${error.message}`);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );

            resolve();
        });
    }

    /**
     * Para de monitorar GPS
     */
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
            log('info', '🛑 GPS monitoramento parado');
        }
    }

    /**
     * Registra listener para mudanças de posição
     */
    onPositionChange(callback) {
        this.listeners.push(callback);
    }

    /**
     * Retorna posição atual
     */
    getCurrentPosition() {
        return this.currentPosition;
    }

    /**
     * Retorna POIs próximos
     */
    getNearbyPOIs(pois, maxDistance = 500) {
        if (!this.currentPosition) return [];

        return pois
            .map(poi => ({
                ...poi,
                distance: calculateDistance(
                    this.currentPosition.latitude,
                    this.currentPosition.longitude,
                    poi.position.latitude,
                    poi.position.longitude
                )
            }))
            .filter(poi => poi.distance <= maxDistance)
            .sort((a, b) => a.distance - b.distance);
    }
}