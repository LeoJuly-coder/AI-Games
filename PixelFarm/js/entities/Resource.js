class Resource extends Phaser.GameObjects.Text {
    constructor(scene, gridX, gridY, type) {
        const worldX = gridX * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
        const worldY = gridY * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;

        const config = RESOURCES[type];
        super(scene, worldX, worldY, config.icon, {
            fontSize: '20px',
            fontFamily: 'Arial'
        });

        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type;
        this.hp = config.hp;
        this.maxHp = config.hp;

        this.setOrigin(0.5);
        this.setDepth(5);
    }
}
