// ============================================
// MAPS TOUR - AR.JS MANAGER
// ============================================

class ARJSManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arSource = null;
        this.arSession = null;
        this.poiModels = new Map();
        this.isInitialized = false;
    }

    /**
     * Inicializa AR.js
     */
    async initialize(containerId) {
        try {
            log('info', '🚀 Inicializando AR.js...');

            // Cria cena Three.js
            this.scene = new THREE.Scene();

            // Cria câmera
            this.camera = new THREE.Camera();
            this.scene.add(this.camera);

            // Cria renderer
            this.renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
                logarithmicDepthBuffer: true
            });

            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);

            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Container ${containerId} não encontrado`);
            }
            container.appendChild(this.renderer.domElement);

            // AR Source (Câmera)
            this.arSource = new THREEx.ArToolkitSource({
                sourceType: 'webcam',
                sourceWidth: 640,
                sourceHeight: 480
            });

            await this.arSource.ready.promise;
            log('success', '✅ Câmera inicializada');

            // AR Session (Rastreamento)
            this.arSession = new THREEx.ArToolkitContext({
                cameraParametersUrl: 'https://cdn.jsdelivr.net/npm/ar.js@3.4.5/three.js/data/data/camera_para.dat',
                detectionMode: 'mono',
                matrixCodeType: '3x3',
                sourceWidth: this.arSource.parameters.sourceWidth,
                sourceHeight: this.arSource.parameters.sourceHeight
            });

            this.arSession.onUpdatedMatrix.addEventListener('arToolkitMatrix', () => {
                this.arSession.update(this.arSource.domElement);
                this.camera.projectionMatrix.copy(this.arSession.getProjectionMatrix());
            });

            // Adiciona iluminação
            this.addLighting();

            // Inicia render loop
            this.startRenderLoop();

            // Responsivo ao redimensionar
            window.addEventListener('resize', () => this.onWindowResize());

            this.isInitialized = true;
            log('success', '✅ AR.js inicializado com sucesso');
            return true;

        } catch (error) {
            log('error', `❌ Erro ao inicializar AR.js: ${error.message}`);
            return false;
        }
    }

    /**
     * Adiciona iluminação à cena
     */
    addLighting() {
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambientLight);

        // Luz direcional
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);
    }

    /**
     * Carrega e renderiza modelo 3D
     */
    addPOIAtLocation(poiId, modelUrl, scale = 1) {
        try {
            const loader = new THREE.GLTFLoader();

            loader.load(
                modelUrl,
                (gltf) => {
                    const model = gltf.scene;
                    
                    model.scale.set(scale, scale, scale);
                    model.position.set(0, 0, -2);
                    model.rotation.x = Math.PI / 6;
                    
                    this.scene.add(model);
                    this.poiModels.set(poiId, model);

                    log('success', `✅ POI ${poiId} renderizado`);
                },
                (progress) => {
                    const percent = (progress.loaded / progress.total) * 100;
                    log('info', `⏳ Carregando ${poiId}: ${percent.toFixed(0)}%`);
                },
                (error) => {
                    log('error', `❌ Erro ao carregar ${poiId}: ${error.message}`);
                }
            );
        } catch (error) {
            log('error', `Erro ao adicionar POI: ${error.message}`);
        }
    }

    /**
     * Loop de renderização
     */
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);

            if (this.arSession) {
                this.arSession.update(this.arSource.domElement);
            }

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    /**
     * Redimensionamento de janela
     */
    onWindowResize() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Limpa recursos
     */
    dispose() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.arSource) {
            this.arSource.domElement.remove();
        }
        this.isInitialized = false;
        log('info', '🧹 Recursos liberados');
    }

    /**
     * Retorna cena
     */
    getScene() {
        return this.scene;
    }

    /**
     * Retorna câmera
     */
    getCamera() {
        return this.camera;
    }
}