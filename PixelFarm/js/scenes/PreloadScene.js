class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.createGameTextures();
    }

    createGameTextures() {
        // 创建草地纹理
        const grassGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        grassGraphics.fillStyle(0x3d6320);
        grassGraphics.fillRect(0, 0, GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        grassGraphics.generateTexture('grass_light', GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        grassGraphics.destroy();

        const grassDarkGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        grassDarkGraphics.fillStyle(0x2d5016);
        grassDarkGraphics.fillRect(0, 0, GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        grassDarkGraphics.generateTexture('grass_dark', GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        grassDarkGraphics.destroy();

        // 创建井纹理
        const wellGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        wellGraphics.fillStyle(0x3498db);
        wellGraphics.fillRect(2, 2, GameConfig.TILE_SIZE - 4, GameConfig.TILE_SIZE - 4);
        wellGraphics.lineStyle(2, 0x2980b9);
        wellGraphics.strokeRect(2, 2, GameConfig.TILE_SIZE - 4, GameConfig.TILE_SIZE - 4);
        wellGraphics.generateTexture('well', GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        wellGraphics.destroy();

        // 创建玩家纹理
        const playerGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        playerGraphics.fillStyle(0xffcc80);
        playerGraphics.fillCircle(14, 10, 8);
        playerGraphics.fillStyle(0x4caf50);
        playerGraphics.fillRect(6, 18, 16, 8);
        playerGraphics.generateTexture('player', GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        playerGraphics.destroy();

        // 创建作物纹理
        this.createCropTextures();
    }

    createCropTextures() {
        // 种子阶段
        const seedGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        seedGraphics.fillStyle(0x8d6e63);
        seedGraphics.fillCircle(14, 14, 4);
        seedGraphics.generateTexture('crop_seed', GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        seedGraphics.destroy();

        // 发芽阶段
        const sproutGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        sproutGraphics.fillStyle(0x4caf50);
        sproutGraphics.fillTriangle(14, 6, 10, 18, 18, 18);
        sproutGraphics.generateTexture('crop_sprout', GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        sproutGraphics.destroy();

        // 幼苗阶段
        const seedlingGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        seedlingGraphics.fillStyle(0x8bc34a);
        seedlingGraphics.fillRect(10, 8, 8, 12);
        seedlingGraphics.fillStyle(0x4caf50);
        seedlingGraphics.fillCircle(14, 8, 4);
        seedlingGraphics.generateTexture('crop_seedling', GameConfig.TILE_SIZE, GameConfig.TILE_SIZE);
        seedlingGraphics.destroy();
    }

    create() {
        this.scene.start('GameScene');
    }
}
