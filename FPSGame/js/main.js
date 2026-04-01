import * as THREE from 'three';
import { GameScene } from './GameScene.js';
import { PlayerController } from './PlayerController.js';
import { WeaponSystem } from './WeaponSystem.js';
import { EnemyManager } from './EnemyManager.js';
import { EffectSystem } from './EffectSystem.js';

class Game {
    constructor() {
        this.container = document.getElementById('game-container');
        this.instructions = document.getElementById('instructions');
        this.isPlaying = false;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.gameScene = new GameScene(this.container);
        this.playerController = new PlayerController(this.gameScene.camera);
        this.effectSystem = new EffectSystem(this.gameScene);
        this.enemyManager = new EnemyManager(this.gameScene);
        this.weaponSystem = new WeaponSystem(this.gameScene);
        
        this.enemyManager.setDependencies(this.playerController, this.effectSystem);
        this.weaponSystem.setDependencies(this.playerController, this.enemyManager, this.effectSystem);
        this.gameScene.setDependencies(this.playerController, this.weaponSystem, this.enemyManager, this.effectSystem);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (!this.isPlaying) {
                this.startGame(e);
            }
        });

        window.addEventListener('resize', () => {
            this.gameScene.onResize();
        });
        
        // 添加夜视模式快捷键
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyN') {
                this.effectSystem.toggleNightVision();
            }
        });
    }

    startGame(event) {
        this.isPlaying = true;
        this.instructions.classList.add('hidden');
        
        if (event.target === this.container || this.container.contains(event.target)) {
            this.container.requestPointerLock();
        } else {
            document.body.requestPointerLock();
        }
        
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.isPlaying) {
            const delta = this.gameScene.clock.getDelta();
            this.playerController.update(delta);
            this.weaponSystem.update(delta);
            this.enemyManager.update(delta);
            this.effectSystem.update(delta);
        }
        
        this.gameScene.render();
    }
    
    // 添加一个方法来测试游戏是否能正常运行
    testGame() {
        console.log('Game initialized successfully!');
        console.log('Scene:', this.gameScene);
        console.log('Player Controller:', this.playerController);
        console.log('Weapon System:', this.weaponSystem);
        console.log('Enemy Manager:', this.enemyManager);
        console.log('Effect System:', this.effectSystem);
    }
}

new Game();
