class Monster extends Phaser.GameObjects.Container {
    constructor(scene, gridX, gridY, type) {
        const worldX = gridX * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
        const worldY = gridY * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;

        super(scene, worldX, worldY);

        this.scene = scene;
        this.gridX = gridX;
        this.gridY = gridY;
        this.type = type;

        const config = MONSTERS[type];
        this.name = config.name;
        this.hp = config.hp;
        this.maxHp = config.hp;
        this.damage = config.damage;
        this.speed = config.speed;

        this.createSprite();
        this.createHealthBar();
        this.setDepth(8);
    }

    createSprite() {
        const config = MONSTERS[this.type];
        this.sprite = this.scene.add.text(0, 0, config.icon, {
            fontSize: '22px',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        this.add(this.sprite);
    }

    createHealthBar() {
        this.healthBarBg = this.scene.add.rectangle(0, -16, 20, 4, 0xe74c3c);
        this.healthBar = this.scene.add.rectangle(0, -16, 20, 4, 0x2ecc71);

        this.add(this.healthBarBg);
        this.add(this.healthBar);
    }

    moveTo(newGridX, newGridY) {
        this.gridX = newGridX;
        this.gridY = newGridY;

        const targetX = newGridX * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;
        const targetY = newGridY * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2;

        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            duration: 200,
            ease: 'Linear'
        });
    }

    takeDamage(damage) {
        this.hp -= damage;
        this.updateHealthBar();

        // 受击闪烁效果
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 50,
            yoyo: true,
            repeat: 2
        });
    }

    updateHealthBar() {
        const percent = Math.max(0, this.hp / this.maxHp);
        this.healthBar.scaleX = percent;
    }
}
