const GameConfig = {
    MAP_SIZE: 24,
    TILE_SIZE: 28,
    STAGE_TIME: 8000,
    WORLD_WIDTH: 24 * 28,
    WORLD_HEIGHT: 24 * 28
};

let PhaserConfig = {
    type: Phaser.AUTO,
    width: 672,
    height: 672,
    parent: 'game-wrapper',
    backgroundColor: '#2d5016',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [],
    pixelArt: true,
    roundPixels: true
};
