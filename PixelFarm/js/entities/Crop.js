class Crop extends Phaser.GameObjects.Container {
    constructor(scene, gridX, gridY, type, stage) {
        const worldX = gridX * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
        const worldY = gridY * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;

        super(scene, worldX, worldY);

        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type;
        this.stage = stage;
        this.watered = false;

        this.createSprite();
        this.createWaterIndicator();
        this.setDepth(6);
    }

    createSprite() {
        if (this.sprite) this.sprite.destroy();

        if (this.stage < 3) {
            const textureKey = ['crop_seed', 'crop_sprout', 'crop_seedling'][this.stage];
            this.sprite = this.scene.add.sprite(0, 0, textureKey);
        } else {
            const fruitConfig = FRUITS[this.type];
            this.sprite = this.scene.add.text(0, 0, fruitConfig.icon, {
                fontSize: '20px',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
        }

        this.add(this.sprite);
    }

    createWaterIndicator() {
        this.waterIndicator = this.scene.add.text(10, -10, '💧', {
            fontSize: '12px',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        this.waterIndicator.setVisible(false);
        this.add(this.waterIndicator);
    }

    setWatered(watered) {
        this.watered = watered;
        this.waterIndicator.setVisible(!watered);
    }

    updateStage(newStage) {
        this.stage = newStage;
        this.createSprite();
        this.createWaterIndicator();
    }
}
