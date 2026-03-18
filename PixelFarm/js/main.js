// 在场景类加载完成后，更新配置并创建游戏
PhaserConfig.scene = [BootScene, PreloadScene, GameScene];
const game = new Phaser.Game(PhaserConfig);
