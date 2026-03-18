class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.add.text(336, 336, '加载中...', {
            fontSize: '24px',
            fill: '#7cb342',
            fontFamily: 'Microsoft YaHei'
        }).setOrigin(0.5);
    }

    create() {
        this.scene.start('PreloadScene');
    }
}
