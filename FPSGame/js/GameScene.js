import * as THREE from 'three';

export class GameScene {
    constructor(container) {
        this.container = container;
        this.clock = new THREE.Clock();
        
        this.initScene();
        this.initCamera();
        this.initRenderer();
        this.initLights();
        this.buildLevel();
    }

    initScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);
        this.scene.fog = new THREE.Fog(0x87ceeb, 20, 100);
    }

    initCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 1.6, 0);
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
    }

    initLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
    }

    buildLevel() {
        this.colliders = [];
        
        this.createGround();
        this.createOutdoorArea();
        this.createBuilding();
        this.createIndoorRooms();
        this.createObstacles();
        this.createCover();
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3d8b3d,
            roughness: 0.8
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        this.colliders.push(ground);
    }

    createOutdoorArea() {
        const obstacles = [
            { x: 15, z: 15, w: 4, h: 3, d: 4 },
            { x: -15, z: 15, w: 4, h: 3, d: 4 },
            { x: 15, z: -15, w: 4, h: 3, d: 4 },
            { x: -15, z: -15, w: 4, h: 3, d: 4 },
            { x: 0, z: 20, w: 8, h: 2, d: 2 },
            { x: 0, z: -20, w: 8, h: 2, d: 2 },
        ];

        obstacles.forEach(obs => {
            const geometry = new THREE.BoxGeometry(obs.w, obs.h, obs.d);
            const material = new THREE.MeshStandardMaterial({ 
                color: 0x8b4513,
                roughness: 0.7
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(obs.x, obs.h / 2, obs.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.colliders.push(mesh);
        });
    }

    createBuilding() {
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            roughness: 0.6
        });
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            roughness: 0.8
        });

        const walls = [
            { x: 0, z: -30, w: 20, h: 5, d: 0.5 },
            { x: 0, z: -40, w: 20, h: 5, d: 0.5 },
            { x: -10, z: -35, w: 0.5, h: 5, d: 10 },
            { x: 10, z: -35, w: 0.5, h: 5, d: 10 },
            { x: -5, z: -25, w: 0.5, h: 5, d: 10 },
            { x: 5, z: -25, w: 0.5, h: 5, d: 10 },
        ];

        walls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(wall.w, wall.h, wall.d);
            const mesh = new THREE.Mesh(geometry, wallMaterial);
            mesh.position.set(wall.x, wall.h / 2, wall.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.colliders.push(mesh);
        });

        const floorGeometry = new THREE.BoxGeometry(20, 0.2, 10);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, 0.1, -35);
        floor.receiveShadow = true;
        this.scene.add(floor);
    }

    createIndoorRooms() {
        const wallMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc,
            roughness: 0.6
        });
        const floorMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x666666,
            roughness: 0.8
        });

        // 创建主房间
        const mainRoomWalls = [
            { x: -10, z: -35, w: 0.5, h: 5, d: 20 },
            { x: 10, z: -35, w: 0.5, h: 5, d: 20 },
            { x: 0, z: -45, w: 20, h: 5, d: 0.5 },
            { x: 0, z: -25, w: 20, h: 5, d: 0.5 },
        ];

        mainRoomWalls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(wall.w, wall.h, wall.d);
            const mesh = new THREE.Mesh(geometry, wallMaterial);
            mesh.position.set(wall.x, wall.h / 2, wall.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.colliders.push(mesh);
        });

        const mainRoomFloor = new THREE.Mesh(
            new THREE.BoxGeometry(20, 0.2, 20),
            floorMaterial
        );
        mainRoomFloor.position.set(0, 0.1, -35);
        mainRoomFloor.receiveShadow = true;
        this.scene.add(mainRoomFloor);
        this.colliders.push(mainRoomFloor);

        // 创建侧房间
        const sideRoomWalls = [
            { x: 15, z: -35, w: 0.5, h: 4, d: 10 },
            { x: 20, z: -30, w: 10, h: 4, d: 0.5 },
            { x: 20, z: -40, w: 10, h: 4, d: 0.5 },
        ];

        sideRoomWalls.forEach(wall => {
            const geometry = new THREE.BoxGeometry(wall.w, wall.h, wall.d);
            const mesh = new THREE.Mesh(geometry, wallMaterial);
            mesh.position.set(wall.x, wall.h / 2, wall.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.colliders.push(mesh);
        });

        const sideRoomFloor = new THREE.Mesh(
            new THREE.BoxGeometry(10, 0.2, 10),
            floorMaterial
        );
        sideRoomFloor.position.set(15, 0.1, -35);
        sideRoomFloor.receiveShadow = true;
        this.scene.add(sideRoomFloor);
        this.colliders.push(sideRoomFloor);
    }

    createObstacles() {
        const obstacleMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x8b4513,
            roughness: 0.7
        });

        const obstacles = [
            { x: 5, z: -35, w: 2, h: 1.5, d: 2 },
            { x: -5, z: -35, w: 2, h: 1.5, d: 2 },
            { x: 0, z: -40, w: 3, h: 1, d: 1 },
            { x: 15, z: -32, w: 1, h: 1.2, d: 1 },
            { x: 15, z: -38, w: 1, h: 1.2, d: 1 },
        ];

        obstacles.forEach(obs => {
            const geometry = new THREE.BoxGeometry(obs.w, obs.h, obs.d);
            const mesh = new THREE.Mesh(geometry, obstacleMaterial);
            mesh.position.set(obs.x, obs.h / 2, obs.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.colliders.push(mesh);
        });
    }

    createCover() {
        const coverMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x555555,
            roughness: 0.8
        });

        const covers = [
            { x: 10, z: 0, w: 4, h: 1, d: 2 },
            { x: -10, z: 0, w: 4, h: 1, d: 2 },
            { x: 0, z: 10, w: 2, h: 1, d: 4 },
            { x: 0, z: -10, w: 2, h: 1, d: 4 },
        ];

        covers.forEach(cover => {
            const geometry = new THREE.BoxGeometry(cover.w, cover.h, cover.d);
            const mesh = new THREE.Mesh(geometry, coverMaterial);
            mesh.position.set(cover.x, cover.h / 2, cover.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.colliders.push(mesh);
        });
    }

    setDependencies(playerController, weaponSystem, enemyManager, effectSystem) {
        this.playerController = playerController;
        this.weaponSystem = weaponSystem;
        this.enemyManager = enemyManager;
        this.effectSystem = effectSystem;
        
        this.playerController.setColliders(this.colliders);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}
