// Classe para gerenciar AR.js
class ARJSManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arSource = null;
        this.arSession = null;
        this.poiModels = new Map(); // Armazena modelos 3D dos POIs
        this.userAvatars = new Map(); // Armazena avatares de outros usuários
    }

    // Inicializa AR.js
    async initialize(containerId) {
        try {
            console.log('🚀 Inicializando AR.js...');

            // 1. Cria a cena Three.js (espaço onde os objetos 3D aparecem)
            this.scene = new THREE.Scene();

            // 2. Cria a câmera (seu "olho" na cena 3D)
            this.camera = new THREE.Camera();
            this.scene.add(this.camera);

            // 3. Cria o renderizador (converte 3D em imagem 2D)
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,           // Suaviza as bordas
                alpha: true,               // Permite transparência
                logarithmicDepthBuffer: true // Melhor para distâncias longas
            });

            // Define o tamanho da janela
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);

            // Coloca o renderer no HTML
            const container = document.getElementById(containerId);
            container.appendChild(this.renderer.domElement);

            // 4. Configura a câmera do telefone (acesso a webcam/câmera traseira)
            this.arSource = new THREEx.ArToolkitSource({
                sourceType: 'webcam',    // Usa a câmera do dispositivo
                sourceWidth: 640,        // Largura da captura
                sourceHeight: 480        // Altura da captura
            });

            // Espera a câmera estar pronta
            await this.arSource.ready.promise;
            console.log('✅ Câmera inicializada');

            // 5. Configura rastreamento AR
            this.arSession = new THREEx.ArToolkitContext({
                cameraParametersUrl: 'https://cdn.jsdelivr.net/npm/ar.js@3.4.5/three.js/data/data/camera_para.dat',
                detectionMode: 'mono',
                matrixCodeType: '3x3',
                sourceWidth: this.arSource.parameters.sourceWidth,
                sourceHeight: this.arSource.parameters.sourceHeight
            });

            // Ajusta a câmera com os parâmetros de rastreamento
            this.arSession.onUpdatedMatrix.addEventListener('arToolkitMatrix', () => {
                this.arSession.update(this.arSource.domElement);
                this.camera.projectionMatrix.copy(this.arSession.getProjectionMatrix());
            });

            // 6. Inicia o loop de renderização
            this.startRenderLoop();

            // 7. Responsiva ao redimensionar janela
            window.addEventListener('resize', () => {
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            });

            console.log('✅ AR.js inicializado com sucesso');
            return true;

        } catch (error) {
            console.error('❌ Erro ao inicializar AR.js:', error);
            return false;
        }
    }

    // Adiciona um modelo 3D na cena
    addPOIAtLocation(poiId, modelUrl, scale = 1) {
    try {
        const loader = new THREE.GLTFLoader();

        loader.load(
            modelUrl,
            (gltf) => {
                const model = gltf.scene;
                
                // Escala
                model.scale.set(scale, scale, scale);
                
                // Posição: 2 metros à frente da câmera
                model.position.set(0, 0, -2);
                
                // Rotação leve
                model.rotation.x = Math.PI / 6; // 30 graus
                
                // Adiciona luz ao modelo
                const light = new THREE.PointLight(0xffffff, 1, 100);
                light.position.set(5, 5, 5);
                model.add(light);
                
                // Adiciona à cena
                this.scene.add(model);
                
                // Guarda referência
                this.poiModels.set(poiId, model);

                console.log(`✅ POI ${poiId} renderizado com sucesso`);
            },
            (progress) => {
                const percent = (progress.loaded / progress.total) * 100;
                console.log(`⏳ Carregando modelo: ${percent.toFixed(0)}%`);
            },
            (error) => {
                console.error(`❌ Erro ao carregar ${poiId}:`, error);
            }
        );
      } catch (error) {
        console.error('Erro ao adicionar POI:', error);
      }
    }

    // Cria avatar para outro usuário
    addUserAvatar(userId, color = 0x00ff00) {
        try {
            // Cria esfera como avatar
            const geometry = new THREE.SphereGeometry(0.15, 32, 32);
            const material = new THREE.MeshStandardMaterial({ 
                color: color,
                metalness: 0.3,
                roughness: 0.6
            });
            const avatar = new THREE.Mesh(geometry, material);

            // Adiciona iluminação ao avatar
            const light = new THREE.PointLight(color, 1, 100);
            light.position.copy(avatar.position);
            light.parent = avatar;
            this.scene.add(light);

            // Guarda o avatar
            this.scene.add(avatar);
            this.userAvatars.set(userId, avatar);

            console.log(`👥 Avatar ${userId} criado`);
            return avatar;

        } catch (error) {
            console.error('Erro ao criar avatar:', error);
        }
    }

    // Atualiza posição do avatar de outro usuário
    updateUserPosition(userId, x, y, z) {
        const avatar = this.userAvatars.get(userId);
        if (avatar) {
            avatar.position.set(x, y, z);
        }
    }

    // Loop de renderização (executa continuamente)
    startRenderLoop() {
        const animate = () => {
            // Chama esta função no próximo frame
            requestAnimationFrame(animate);

            // Atualiza o rastreamento AR
            if (this.arSession) {
                this.arSession.update(this.arSource.domElement);
            }

            // Renderiza a cena
            this.renderer.render(this.scene, this.camera);
        };

        // Inicia o loop
        animate();
    }

    // Retorna a cena (para outras partes do código usarem)
    getScene() {
        return this.scene;
    }

    // Retorna a câmera
    getCamera() {
        return this.camera;
    }

    // Limpa recursos quando fechar AR
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.arSource) {
            this.arSource.domElement.remove();
        }
    }
}