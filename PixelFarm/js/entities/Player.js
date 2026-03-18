class Player extends Phaser.GameObjects.Sprite {
    constructor(scene, gridX, gridY) {
        const worldX = gridX * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
        const worldY = gridY * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;

        super(scene, worldX, worldY, 'player');

        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.isMoving = false;

        this.setDepth(10);
    }

    moveTo(newGridX, newGridY) {
        if (this.isMoving) return false;

        this.isMoving = true;
        this.gridX = newGridX;
        this.gridY = newGridY;

        const targetX = newGridX * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
        const targetY = newGridY * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: 250,
            ease: 'Linear',
            onComplete: () => {
                this.isMoving = false;
            }
        });
        return true;
    }
}
