// Importa funções do Firebase
import { getDatabase, ref, onValue, set, remove, serverTimestamp } 
    from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// Classe para sincronizar dados com Firebase
export class FirebaseSync {
    constructor(firebaseDb, sessionId, userId) {
        this.db = firebaseDb;           // Banco de dados
        this.sessionId = sessionId;     // ID da sessão atual
        this.userId = userId;           // ID do usuário
        this.listeners = new Map();     // Funções que escutam mudanças
        this.updateInterval = null;     // Timer para publicar posição
    }

    // Começa a publicar a posição do usuário a cada segundo
    startPublishingPosition(geoManager) {
        this.updateInterval = setInterval(() => {
            const position = geoManager.getCurrentPosition();
            if (!position) return; // Se não tem posição, pula

            // Objeto com dados do usuário
            const userData = {
                position: {
                    latitude: position.latitude,
                    longitude: position.longitude,
                    altitude: position.altitude
                },
                accuracy: position.accuracy,
                lastUpdate: serverTimestamp(),  // Hora do servidor
                platform: 'web'
            };

            // Escreve no banco de dados
            set(
                ref(this.db, `activeSessions/${this.sessionId}/users/${this.userId}`),
                userData
            ).catch(err => console.error('❌ Erro ao publicar posição:', err));
        }, 1000); // A cada 1000ms (1 segundo)
    }

    // Escuta outros usuários da sessão
    listenToUsers(callback) {
        // Referência no banco de dados
        const usersRef = ref(this.db, `activeSessions/${this.sessionId}/users`);

        // Quando dados mudarem, esta função é chamada
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const users = {};

            // Itera por cada usuário no banco
            snapshot.forEach(child => {
                if (child.key !== this.userId) { // Ignora a si mesmo
                    users[child.key] = child.val();
                }
            });

            // Chama a função do usuário com os dados
            callback(users);
        });

        // Guarda referência para parar de escutar depois
        this.listeners.set('users', unsubscribe);
        return unsubscribe;
    }

    // Escuta POIs (Pontos de Interesse) do tour
    listenToPOIs(tourId, callback) {
        const poisRef = ref(this.db, `tours/${tourId}/pois`);

        const unsubscribe = onValue(poisRef, (snapshot) => {
            const pois = [];

            snapshot.forEach(child => {
                pois.push({
                    id: child.key,
                    ...child.val()  // Copia todos os dados do POI
                });
            });

            callback(pois);
        });

        this.listeners.set('pois', unsubscribe);
        return unsubscribe;
    }

    // Escuta informações do tour
    listenToTour(tourId, callback) {
        const tourRef = ref(this.db, `tours/${tourId}`);

        const unsubscribe = onValue(tourRef, (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.val());
            }
        });

        this.listeners.set('tour', unsubscribe);
        return unsubscribe;
    }

    // Remove o usuário do banco de dados quando sair
    async removeUser() {
        // Para de publicar posição
        if (this.updateInterval) clearInterval(this.updateInterval);
        
        // Remove do banco
        await remove(ref(this.db, `activeSessions/${this.sessionId}/users/${this.userId}`));
        
        console.log('👋 Usuário removido da sessão');
    }

    // Para de escutar todas as mudanças
    unsubscribeAll() {
        this.listeners.forEach(unsubscribe => unsubscribe());
        this.listeners.clear();
    }
}