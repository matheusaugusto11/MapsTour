// Classe para gerenciar GPS
class GeoLocationManager {
    constructor() {
        this.currentPosition = null;
        this.watchId = null;
        this.listeners = [];  // Funções que querem saber da mudança de posição
    }

    // Inicia monitoramento contínuo de GPS
    async startWatching() {
        return new Promise((resolve, reject) => {
            // Verifica se o navegador suporta geolocalização
            if (!navigator.geolocation) {
                reject(new Error('❌ Geolocalização não suportada'));
                return;
            }

            // Começa a monitorar a posição
            this.watchId = navigator.geolocation.watchPosition(
                (position) => {
                    // Sucesso: posição atualizada
                    this.currentPosition = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude || 0,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    };

                    console.log(`📍 Posição: ${this.currentPosition.latitude}, ${this.currentPosition.longitude}`);

                    // Notifica todas as funções que querem saber da mudança
                    this.listeners.forEach(callback => callback(this.currentPosition));
                },
                (error) => {
                    // Erro ao obter posição
                    console.error('❌ Erro de geolocalização:', error.message);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,  // Usa GPS em vez de rádio (mais preciso)
                    timeout: 10000,             // Espera 10 segundos
                    maximumAge: 0               // Não usa cache
                }
            );

            resolve();
        });
    }

    // Registra uma função para ser chamada quando posição mudar
    onPositionChange(callback) {
        this.listeners.push(callback);
    }

    // Para de monitorar GPS
    stopWatching() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
    }

    // Retorna a posição atual
    getCurrentPosition() {
        return this.currentPosition;
    }

    // Calcula distância entre dois pontos GPS usando Fórmula de Haversine
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km

        // Converte para radianos (unidade de ângulo)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;

        // Fórmula de Haversine
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distância em km

        return distance * 1000; // Retorna em metros
    }

    // Retorna POIs que estão perto do usuário
    getNearbyPOIs(pois, maxDistance = 100) {
        if (!this.currentPosition) return [];

        // Filtra POIs dentro da distância máxima
        return pois
            .filter(poi => {
                const distance = GeoLocationManager.calculateDistance(
                    this.currentPosition.latitude,
                    this.currentPosition.longitude,
                    poi.position.latitude,
                    poi.position.longitude
                );
                return distance < maxDistance;
            })
            // Ordena por proximidade (mais perto primeiro)
            .sort((a, b) => {
                const distA = GeoLocationManager.calculateDistance(
                    this.currentPosition.latitude,
                    this.currentPosition.longitude,
                    a.position.latitude,
                    a.position.longitude
                );
                const distB = GeoLocationManager.calculateDistance(
                    this.currentPosition.latitude,
                    this.currentPosition.longitude,
                    b.position.latitude,
                    b.position.longitude
                );
                return distA - distB;
            });
    }
}