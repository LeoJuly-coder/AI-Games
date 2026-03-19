class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        currentGameScene = this;
        this.initGameState();
        this.createMap();
        this.createPlayer();
        this.createGroups();
        this.spawnInitialResources();
        this.setupInput();
        this.setupCamera();
        this.setupTimers();
        this.setupAudio();
        this.updateUI();
        this.addLog('欢迎来到像素农场！', 'info');
        this.addLog('WASD移动，走到树枝🌿碎石🪨上自动拾取', 'info');
    }

    setupAudio() {
        // 预加载音效（实际项目中需要添加真实的音效文件）
        this.sounds = {
            background: true, // 背景音乐
            plant: true, // 种植音效
            water: true, // 浇水音效
            harvest: true, // 收获音效
            attack: true, // 攻击音效
            hit: true, // 被攻击音效
            collect: true, // 采集音效
            craft: true, // 制造音效
            levelUp: true, // 升级音效
            taskComplete: true // 任务完成音效
        };
        
        // 播放背景音乐
        this.playSound('background');
    }

    playSound(soundName) {
        // 实际项目中这里会播放真实的音效
        // 现在只是模拟音效播放
        console.log(`播放音效: ${soundName}`);
    }

    initGameState() {
        this.gameState = {
            player: { hp: 100, maxHp: 100, atk: 5, exp: 0, level: 1, facing: 'down' },
            selectedTool: null,
            selectedSeed: null,
            warehouse: { strawberry_seed: 3, wateringCan: 1, wateringCan_water: 5 },
            equipment: { weapon: null, tool: null, accessory: null },
            gold: 50,
            map: [],
            // 任务系统
            tasks: JSON.parse(JSON.stringify(TASKS)),
            taskProgress: {
                plant: {},
                water: 0,
                harvest: 0,
                collect: {},
                kill: 0,
                craft: {}
            }
        };

        this.inventorySystem = new InventorySystem(this);
        this.craftSystem = new CraftSystem(this);
    }

    createMap() {
        this.mapTiles = [];
        for (let y = 0; y < GameConfig.MAP_SIZE; y++) {
            this.gameState.map[y] = [];
            this.mapTiles[y] = [];
            for (let x = 0; x < GameConfig.MAP_SIZE; x++) {
                const texture = ((x + y) % 2 === 0) ? 'grass_light' : 'grass_dark';
                const tile = this.add.sprite(
                    x * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2,
                    y * GameConfig.TILE_SIZE + GameConfig.TILE_SIZE / 2,
                    texture
                );
                this.mapTiles[y][x] = { sprite: tile, type: 'empty', content: null };
                this.gameState.map[y][x] = { type: 'empty', crop: null, resource: null };
            }
        }

        // 创建井
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                const x = 4 + dx;
                const y = 4 + dy;
                this.mapTiles[y][x].sprite.setTexture('well');
                this.mapTiles[y][x].type = 'well';
                this.gameState.map[y][x].type = 'well';
            }
        }
        
        // 创建建造台
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                const x = 8 + dx;
                const y = 4 + dy;
                this.mapTiles[y][x].sprite.setTexture('crafting_table');
                this.mapTiles[y][x].type = 'building';
                this.gameState.map[y][x].type = 'building';
                this.gameState.map[y][x].buildingType = 'crafting_table';
            }
        }
        
        // 创建商店
        for (let dy = 0; dy < 2; dy++) {
            for (let dx = 0; dx < 2; dx++) {
                const x = 12 + dx;
                const y = 4 + dy;
                this.mapTiles[y][x].sprite.setTexture('shop');
                this.mapTiles[y][x].type = 'building';
                this.gameState.map[y][x].type = 'building';
                this.gameState.map[y][x].buildingType = 'shop';
            }
        }
    }

    createPlayer() {
        this.player = new Player(this, 12, 12);
        this.add.existing(this.player);
    }

    createGroups() {
        this.resourceGroup = this.add.group();
        this.cropGroup = this.add.group();
        this.monsterGroup = this.add.group();
    }

    spawnInitialResources() {
        const resourceTypes = [
            { type: 'twig', count: 25 },
            { type: 'stone_small', count: 25 },
            { type: 'tree_small', count: 15 },
            { type: 'tree_medium', count: 10 },
            { type: 'tree_large', count: 5 },
            { type: 'rock_small', count: 12 },
            { type: 'rock_medium', count: 8 },
            { type: 'rock_large', count: 4 }
        ];

        resourceTypes.forEach(({ type, count }) => {
            for (let i = 0; i < count; i++) {
                this.spawnResource(type);
            }
        });
    }

    spawnResource(type) {
        for (let attempts = 0; attempts < 50; attempts++) {
            const x = Phaser.Math.Between(0, GameConfig.MAP_SIZE - 1);
            const y = Phaser.Math.Between(0, GameConfig.MAP_SIZE - 1);

            if (Math.abs(x - 12) < 4 && Math.abs(y - 12) < 4) continue;
            if (x >= 4 && x <= 5 && y >= 4 && y <= 5) continue;
            if (this.gameState.map[y][x].type !== 'empty') continue;

            const resource = new Resource(this, x, y, type);
            this.add.existing(resource);
            this.resourceGroup.add(resource);
            this.gameState.map[y][x] = { type: 'resource', resource: { type, hp: RESOURCES[type].hp, maxHp: RESOURCES[type].hp } };
            return true;
        }
        return false;
    }

    setupInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });

        // 数字键切换工具
        this.input.keyboard.on('keydown-ONE', () => this.selectTool('plant'));
        this.input.keyboard.on('keydown-TWO', () => this.selectTool('water'));
        this.input.keyboard.on('keydown-THREE', () => this.selectTool('fertilize'));
        this.input.keyboard.on('keydown-FOUR', () => this.selectTool('harvest'));
        this.input.keyboard.on('keydown-FIVE', () => this.selectTool('axe'));
        this.input.keyboard.on('keydown-SIX', () => this.selectTool('pickaxe'));
        this.input.keyboard.on('keydown-SEVEN', () => this.selectTool('sword'));
        this.input.keyboard.on('keydown-EIGHT', () => this.selectTool('fillWater'));

        this.input.keyboard.on('keydown-SPACE', () => this.useTool());
    }

    setupCamera() {
        this.cameras.main.setBounds(0, 0, GameConfig.WORLD_WIDTH, GameConfig.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    }

    setupTimers() {
        // 作物生长定时器
        this.time.addEvent({
            delay: 1000,
            callback: this.updateCrops,
            callbackScope: this,
            loop: true
        });

        // 怪物AI定时器
        this.time.addEvent({
            delay: 500,
            callback: this.updateMonsters,
            callbackScope: this,
            loop: true
        });

        // 怪物生成定时器
        this.time.addEvent({
            delay: 5000,
            callback: this.trySpawnMonster,
            callbackScope: this,
            loop: true
        });
    }

    update() {
        this.handlePlayerMovement();
    }

    handlePlayerMovement() {
        let dx = 0, dy = 0;

        // 优先处理水平方向，禁止斜向移动
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            dx = -1;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            dx = 1;
        } else if (this.cursors.up.isDown || this.wasd.up.isDown) {
            dy = -1;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            dy = 1;
        }

        if (dx !== 0 || dy !== 0) {
            this.movePlayer(dx, dy);
        }
    }

    movePlayer(dx, dy) {
        const newX = this.player.gridX + dx;
        const newY = this.player.gridY + dy;

        if (newX < 0 || newX >= GameConfig.MAP_SIZE || newY < 0 || newY >= GameConfig.MAP_SIZE) return;

        const cell = this.gameState.map[newY][newX];

        // 自动拾取资源
        if (cell.type === 'resource' && cell.resource) {
            const resConfig = RESOURCES[cell.resource.type];
            if (!resConfig.tool) {
                Object.entries(resConfig.drops).forEach(([item, count]) => {
                    this.inventorySystem.addItem(item, count);
                    this.addLog(`拾取了 ${ITEM_NAMES[item]} x${count}`, 'loot');
                });
                // 更新任务进度
                this.updateTaskProgress('collect', resConfig.drops);
                
                // 播放音效
                this.playSound('collect');
                
                this.removeResourceAt(newX, newY);
                return;
            }
        }

        // 检查碰撞
        if (cell.type === 'well' || cell.type === 'resource' || cell.type === 'building') return;

        // 检查怪物
        const monster = this.monsterGroup.getChildren().find(m => m.gridX === newX && m.gridY === newY);
        if (monster) {
            this.attackMonster(monster);
            return;
        }

        // 移动玩家
        this.player.moveTo(newX, newY);
    }

    removeResourceAt(x, y) {
        const resource = this.resourceGroup.getChildren().find(r => r.gridX === x && r.gridY === y);
        if (resource) {
            resource.destroy();
            this.gameState.map[y][x] = { type: 'empty', crop: null, resource: null };
        }
    }

    attackMonster(monster) {
        const damage = this.gameState.player.atk;
        monster.takeDamage(damage);
        
        // 播放音效
        this.playSound('attack');
        
        this.addLog(`你攻击了${monster.name}，造成${damage}点伤害`, 'info');

        if (monster.hp <= 0) {
            const monsterConfig = MONSTERS[monster.type];
            const drops = monsterConfig.drops;
            
            // 掉落物品
            Object.entries(drops).forEach(([item, count]) => {
                this.inventorySystem.addItem(item, count);
                this.addLog(`获得 ${ITEM_NAMES[item]} x${count}`, 'loot');
            });
            
            // 获得经验值
            const exp = monsterConfig.level * 10;
            this.gameState.player.exp += exp;
            this.checkLevelUp();
            this.addLog(`获得${exp}经验值`, 'success');
            
            // 更新任务进度
            this.updateTaskProgress('kill');
            
            monster.destroy();
            this.addLog(`击败了${monster.name}！`, 'success');
        }
    }

    updateCrops() {
        const now = Date.now();
        for (let y = 0; y < GameConfig.MAP_SIZE; y++) {
            for (let x = 0; x < GameConfig.MAP_SIZE; x++) {
                const cell = this.gameState.map[y][x];
                if (cell.crop && cell.crop.watered && cell.crop.stage < 3) {
                    if (now >= cell.crop.growthTime) {
                        cell.crop.stage++;
                        cell.crop.watered = false;
                        cell.crop.growthTime = now + GameConfig.STAGE_TIME;

                        const crop = this.cropGroup.getChildren().find(c => c.gridX === x && c.gridY === y);
                        if (crop) {
                            crop.updateStage(cell.crop.stage);
                            crop.setWatered(false);
                        }
                    }
                }
            }
        }
    }

    updateMonsters() {
        this.monsterGroup.getChildren().forEach(monster => {
            const dx = this.player.gridX - monster.gridX;
            const dy = this.player.gridY - monster.gridY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const monsterConfig = MONSTERS[monster.type];
            
            // 根据怪物等级计算仇恨范围：等级1-2为3格，等级3-4为5格，等级5+为7格
            const aggroRange = Math.min(7, Math.max(3, Math.floor(monsterConfig.level / 2) * 2 + 1));

            if (dist <= 1) {
                // 攻击玩家
                const damage = monsterConfig.damage;
                this.gameState.player.hp -= damage;
                
                // 播放音效
                this.playSound('hit');
                
                // 特殊攻击效果
                if (monsterConfig.poison) {
                    // 中毒效果：持续伤害
                    this.addLog(`${monster.name}的攻击使你中毒了！`, 'error');
                    this.time.addEvent({
                        delay: 1000,
                        callback: () => {
                            if (this.gameState.player.hp > 0) {
                                this.gameState.player.hp -= 2;
                                this.addLog('中毒持续伤害-2', 'error');
                                this.updateUI();
                            }
                        },
                        callbackScope: this,
                        loop: false
                    });
                } else if (monsterConfig.fire) {
                    // 火焰效果：额外伤害
                    const fireDamage = 5;
                    this.gameState.player.hp -= fireDamage;
                    this.addLog(`${monster.name}的火焰攻击造成额外${fireDamage}点伤害！`, 'error');
                }
                
                this.addLog(`${monster.name}攻击了你，受到${damage}点伤害！`, 'error');
                this.updateUI();

                if (this.gameState.player.hp <= 0) {
                    this.gameState.player.hp = 0;
                    this.addLog('你被击败了！游戏结束', 'error');
                }
            } else if (dist <= aggroRange && Math.random() < 0.3) {
                // 向玩家移动（只能横着或竖着走）
                let moveX = 0, moveY = 0;
                
                // 优先选择距离更大的方向
                if (Math.abs(dx) >= Math.abs(dy)) {
                    moveX = dx > 0 ? 1 : -1;
                } else {
                    moveY = dy > 0 ? 1 : -1;
                }
                
                const newX = monster.gridX + moveX;
                const newY = monster.gridY + moveY;

                // 飞行怪物可以穿过障碍物
                if (monsterConfig.flying) {
                    if (newX >= 0 && newX < GameConfig.MAP_SIZE && newY >= 0 && newY < GameConfig.MAP_SIZE) {
                        monster.moveTo(newX, newY);
                    }
                } else if (this.canMoveTo(newX, newY)) {
                    monster.moveTo(newX, newY);
                }
            }
        });
    }

    trySpawnMonster() {
        if (this.monsterGroup.getLength() >= 3) return;
        if (Math.random() > 0.3) return;

        // 根据玩家等级选择合适的怪物
        const playerLevel = this.gameState.player.level;
        const availableMonsters = Object.keys(MONSTERS).filter(type => {
            const monsterLevel = MONSTERS[type].level;
            return monsterLevel <= playerLevel + 2 && monsterLevel >= Math.max(1, playerLevel - 1);
        });

        if (availableMonsters.length === 0) return;

        const type = availableMonsters[Phaser.Math.Between(0, availableMonsters.length - 1)];

        for (let attempts = 0; attempts < 20; attempts++) {
            const x = Phaser.Math.Between(0, GameConfig.MAP_SIZE - 1);
            const y = Phaser.Math.Between(0, GameConfig.MAP_SIZE - 1);

            const dist = Math.sqrt(Math.pow(x - this.player.gridX, 2) + Math.pow(y - this.player.gridY, 2));
            const monsterConfig = MONSTERS[type];
            
            // 检查位置是否有其他资源或怪物
            const cell = this.gameState.map[y][x];
            const hasResource = cell.type === 'resource' || cell.type === 'crop' || cell.type === 'well' || cell.type === 'building';
            const hasMonster = this.monsterGroup.getChildren().some(m => m.gridX === x && m.gridY === y);
            
            // 飞行怪物可以在任何位置生成，其他怪物需要在可移动位置生成，且不能与资源或其他怪物叠加
            if (dist > 5 && !hasMonster && (monsterConfig.flying || (this.canMoveTo(x, y) && !hasResource))) {
                const monster = new Monster(this, x, y, type);
                this.add.existing(monster);
                this.monsterGroup.add(monster);
                this.addLog(`${MONSTERS[type].name}出现了！`, 'warning');
                break;
            }
        }
    }

    canMoveTo(x, y) {
        if (x < 0 || x >= GameConfig.MAP_SIZE || y < 0 || y >= GameConfig.MAP_SIZE) return false;
        const cell = this.gameState.map[y][x];
        // 怪物只能移动到空位置，不能移动到有资源、作物、井或建筑物的位置
        return cell.type === 'empty';
    }

    selectTool(tool) {
        const toolBtn = document.querySelector(`[data-tool="${tool}"]`);
        if (toolBtn && toolBtn.disabled) {
            this.addLog('你还没有这个工具，请先制造', 'warning');
            return;
        }

        document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.grid-item').forEach(btn => btn.classList.remove('active'));

        this.gameState.selectedTool = tool;
        this.gameState.selectedSeed = null;

        document.getElementById('currentTool').textContent = TOOL_NAMES[tool] || tool;
    }

    useTool() {
        const x = this.player.gridX;
        const y = this.player.gridY;
        
        // 检查是否靠近建筑物
        const nearbyBuilding = this.getNearbyBuilding(x, y);
        if (nearbyBuilding) {
            this.handleBuildingInteraction(nearbyBuilding);
            return;
        }

        if (!this.gameState.selectedTool) {
            this.addLog('请先选择一个工具', 'warning');
            return;
        }

        const cell = this.gameState.map[y][x];

        switch (this.gameState.selectedTool) {
            case 'plant':
                this.handlePlant(cell, x, y);
                break;
            case 'water':
                this.handleWater(cell, x, y);
                break;
            case 'fertilize':
                this.handleFertilize(cell);
                break;
            case 'harvest':
                this.handleHarvest(cell, x, y);
                break;
            case 'axe':
            case 'pickaxe':
                this.handleMining(cell, x, y);
                break;
            case 'fillWater':
                this.handleFillWater(x, y);
                break;
        }

        this.updateUI();
    }

    getNearbyBuilding(x, y) {
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = x + dx;
                const checkY = y + dy;
                if (checkX >= 0 && checkX < GameConfig.MAP_SIZE && checkY >= 0 && checkY < GameConfig.MAP_SIZE) {
                    const cell = this.gameState.map[checkY][checkX];
                    if (cell.type === 'building') {
                        return {
                            type: cell.buildingType,
                            x: checkX,
                            y: checkY
                        };
                    }
                }
            }
        }
        return null;
    }

    handleBuildingInteraction(building) {
        switch (building.type) {
            case 'crafting_table':
                this.showCraftingMenu();
                break;
            case 'shop':
                this.showShopMenu();
                break;
        }
    }

    showCraftingMenu() {
        // 显示建造武器的菜单
        let craftOptions = '';
        Object.entries(RECIPES).forEach(([key, recipe]) => {
            if (recipe.type === 'weapon') {
                const canCraft = Object.entries(recipe.materials).every(([mat, count]) => {
                    return (this.gameState.warehouse[mat] || 0) >= count;
                });
                craftOptions += `
${recipe.icon} ${recipe.name} - ${canCraft ? '可制造' : '材料不足'}`;
            }
        });
        
        if (craftOptions) {
            this.addLog('建造台：选择要制造的武器', 'info');
            this.addLog(craftOptions, 'info');
        } else {
            this.addLog('建造台：没有可制造的武器', 'info');
        }
    }

    showShopMenu() {
        // 显示商店菜单
        this.addLog('🏪 商店', 'info');
        this.addLog('出售物品：', 'info');
        
        // 显示可出售的物品
        let hasItems = false;
        Object.entries(FRUITS).forEach(([key, fruit]) => {
            if (this.inventorySystem.hasItem(key, 1)) {
                this.addLog(`${fruit.icon} ${fruit.name} - ${fruit.sellPrice}金币`, 'info');
                hasItems = true;
            }
        });
        
        if (!hasItems) {
            this.addLog('没有可出售的物品', 'info');
        }
        
        this.addLog('购买物品：', 'info');
        
        // 显示可购买的种子
        Object.entries(FRUITS).forEach(([key, fruit]) => {
            if (this.gameState.gold >= fruit.buyPrice) {
                this.addLog(`${fruit.icon} ${fruit.name}种子 - ${fruit.buyPrice}金币`, 'info');
            } else {
                this.addLog(`${fruit.icon} ${fruit.name}种子 - ${fruit.buyPrice}金币 (金币不足)`, 'info');
            }
        });
        
        this.addLog('按对应数字键进行操作', 'info');
    }

    handlePlant(cell, x, y) {
        if (!this.gameState.selectedSeed) {
            this.addLog('请先选择种子', 'warning');
            return;
        }
        if (cell.type !== 'empty') {
            this.addLog('这里不能种植', 'error');
            return;
        }
        if (!this.inventorySystem.hasItem(this.gameState.selectedSeed, 1)) {
            this.addLog('种子不足', 'error');
            return;
        }

        this.inventorySystem.removeItem(this.gameState.selectedSeed, 1);
        cell.type = 'crop';
        const cropType = this.gameState.selectedSeed.replace('_seed', '');
        const baseGrowthTime = FRUITS[cropType].growthTime || GameConfig.STAGE_TIME;
        
        cell.crop = {
            type: cropType,
            stage: 0,
            watered: false,
            fertilized: false,
            growthTime: Date.now() + baseGrowthTime
        };

        const crop = new Crop(this, x, y, cell.crop.type, 0);
        crop.setWatered(false);
        this.add.existing(crop);
        this.cropGroup.add(crop);

        // 更新任务进度
        this.updateTaskProgress('plant', this.gameState.selectedSeed);
        
        // 播放音效
        this.playSound('plant');
        
        this.addLog('种植了种子，需要浇水', 'success');
    }

    handleWater(cell, x, y) {
        // 检查是否装备了水壶
        if (this.gameState.equipment.tool !== 'wateringCan') {
            this.addLog('需要装备水壶才能浇水', 'error');
            return;
        }
        if (this.gameState.warehouse.wateringCan_water <= 0) {
            this.addLog('洒水壶没水了，去打水', 'warning');
            return;
        }
        if (!cell.crop) {
            this.addLog('这里没有作物', 'error');
            return;
        }
        if (cell.crop.watered) {
            this.addLog('已经浇过水了', 'warning');
            return;
        }

        cell.crop.watered = true;
        this.gameState.warehouse.wateringCan_water--;
        
        // 更新作物显示
        const crop = this.cropGroup.getChildren().find(c => c.gridX === x && c.gridY === y);
        if (crop) {
            crop.setWatered(true);
        }
        
        // 更新任务进度
        this.updateTaskProgress('water');
        
        // 播放音效
        this.playSound('water');
        
        this.addLog('浇了水', 'success');
    }

    handleFertilize(cell) {
        if (!cell.crop) {
            this.addLog('这里没有作物', 'error');
            return;
        }
        if (cell.crop.fertilized) {
            this.addLog('已经施过肥了', 'warning');
            return;
        }

        cell.crop.fertilized = true;
        cell.crop.growthTime -= GameConfig.STAGE_TIME * 0.5;
        this.addLog('施肥成功，生长速度加快', 'success');
    }

    handleHarvest(cell, x, y) {
        if (!cell.crop) {
            this.addLog('这里没有作物', 'error');
            return;
        }
        if (cell.crop.stage < 3) {
            this.addLog('作物还没有成熟', 'warning');
            return;
        }

        const fruitType = cell.crop.type;
        this.inventorySystem.addItem(fruitType, 1);
        this.addLog(`收获了${FRUITS[fruitType].name}`, 'success');

        const crop = this.cropGroup.getChildren().find(c => c.gridX === x && c.gridY === y);
        if (crop) crop.destroy();

        // 更新任务进度
        this.updateTaskProgress('harvest');
        
        // 播放音效
        this.playSound('harvest');
        
        this.gameState.map[y][x] = { type: 'empty', crop: null, resource: null };
    }

    handleMining(cell, x, y) {
        if (cell.type !== 'resource' || !cell.resource) {
            this.addLog('这里没有资源', 'error');
            return;
        }
        const resConfig = RESOURCES[cell.resource.type];
        if (resConfig.tool !== this.gameState.selectedTool) {
            this.addLog('工具不对', 'error');
            return;
        }

        cell.resource.hp--;
        if (cell.resource.hp <= 0) {
            Object.entries(resConfig.drops).forEach(([item, count]) => {
                this.inventorySystem.addItem(item, count);
                this.addLog(`获得了 ${ITEM_NAMES[item]} x${count}`, 'loot');
            });
            // 更新任务进度
            this.updateTaskProgress('collect', resConfig.drops);
            
            // 播放音效
            this.playSound('collect');
            
            this.removeResourceAt(x, y);
        } else {
            this.addLog(`采集进度: ${cell.resource.hp}/${cell.resource.maxHp}`, 'info');
        }
    }

    handleFillWater(x, y) {
        let nearWell = false;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const checkX = x + dx;
                const checkY = y + dy;
                if (checkX >= 0 && checkX < GameConfig.MAP_SIZE && checkY >= 0 && checkY < GameConfig.MAP_SIZE) {
                    if (this.gameState.map[checkY][checkX].type === 'well') {
                        nearWell = true;
                    }
                }
            }
        }

        if (!nearWell) {
            this.addLog('你需要在井边才能打水', 'warning');
            return;
        }
        if (!this.inventorySystem.hasItem('wateringCan', 1)) {
            this.addLog('你没有洒水壶', 'error');
            return;
        }

        this.gameState.warehouse.wateringCan_water = 10;
        this.addLog('打满了水', 'success');
    }

    updateUI() {
        document.getElementById('goldCount').textContent = this.gameState.gold;
        document.getElementById('hpCount').textContent = `${this.gameState.player.hp}/${this.gameState.player.maxHp}`;
        document.getElementById('atkCount').textContent = this.gameState.player.atk;
        document.getElementById('expCount').textContent = `${this.gameState.player.exp}`;
        document.getElementById('levelCount').textContent = `${this.gameState.player.level}`;

        // 更新玩家状态悬浮窗
        this.updatePlayerStatusUI();

        this.updateEquipmentUI();
        this.updateSeedUI();
        this.updateShopUI();
        this.updateCraftUI();
        this.updateWarehouseUI();
        this.updateTaskUI();
    }

    updatePlayerStatusUI() {
        const player = this.gameState.player;
        const expNeeded = player.level * 100;
        const expPercentage = (player.exp / expNeeded) * 100;
        const hpPercentage = (player.hp / player.maxHp) * 100;

        // 更新状态值
        document.getElementById('statusLevel').textContent = player.level;
        document.getElementById('statusHp').textContent = `${player.hp}/${player.maxHp}`;
        document.getElementById('statusAtk').textContent = player.atk;
        document.getElementById('statusGold').textContent = this.gameState.gold;
        document.getElementById('statusExp').textContent = `${player.exp}/${expNeeded}`;

        // 更新进度条
        document.getElementById('hpFill').style.width = `${hpPercentage}%`;
        document.getElementById('expFill').style.width = `${expPercentage}%`;
    }

    // 任务系统方法
    updateTaskProgress(type, data) {
        const progress = this.gameState.taskProgress;
        
        switch (type) {
            case 'plant':
                const seedType = data;
                progress.plant[seedType] = (progress.plant[seedType] || 0) + 1;
                break;
            case 'water':
                progress.water++;
                break;
            case 'harvest':
                progress.harvest++;
                break;
            case 'collect':
                Object.entries(data).forEach(([item, count]) => {
                    progress.collect[item] = (progress.collect[item] || 0) + count;
                });
                break;
            case 'kill':
                progress.kill++;
                break;
            case 'craft':
                const craftItem = data;
                progress.craft[craftItem] = (progress.craft[craftItem] || 0) + 1;
                break;
        }
        
        this.checkTaskCompletion();
    }

    checkTaskCompletion() {
        const tasks = this.gameState.tasks;
        const progress = this.gameState.taskProgress;
        
        Object.values(tasks).forEach(task => {
            if (task.completed) return;
            
            let isCompleted = false;
            
            switch (task.target.type) {
                case 'plant':
                    isCompleted = (progress.plant[task.target.item] || 0) >= task.target.count;
                    break;
                case 'water':
                    isCompleted = progress.water >= task.target.count;
                    break;
                case 'harvest':
                    isCompleted = progress.harvest >= task.target.count;
                    break;
                case 'collect':
                    isCompleted = Object.entries(task.target.items).every(([item, count]) => {
                        return (progress.collect[item] || 0) >= count;
                    });
                    break;
                case 'kill':
                    isCompleted = progress.kill >= task.target.count;
                    break;
                case 'craft':
                    isCompleted = Object.entries(task.target.items).every(([item, count]) => {
                        return (progress.craft[item] || 0) >= count;
                    });
                    break;
            }
            
            if (isCompleted) {
            task.completed = true;
            
            // 播放音效
            this.playSound('taskComplete');
            
            this.awardTaskReward(task);
        }
        });
    }

    awardTaskReward(task) {
        const reward = task.reward;
        if (reward.gold) {
            this.gameState.gold += reward.gold;
        }
        if (reward.exp) {
            this.gameState.player.exp += reward.exp;
            this.checkLevelUp();
        }
        this.addLog(`完成任务「${task.name}」，获得${reward.gold}金币和${reward.exp}经验`, 'success');
        this.updateUI();
    }

    checkLevelUp() {
        const player = this.gameState.player;
        const expNeeded = player.level * 100;
        if (player.exp >= expNeeded) {
            player.exp -= expNeeded;
            player.level++;
            player.maxHp += 10;
            player.hp = player.maxHp;
            player.atk += 2;
            
            // 播放音效
            this.playSound('levelUp');
            
            this.addLog(`升级了！等级${player.level}，生命值和攻击力提升`, 'success');
        }
    }

    updateTaskUI() {
        const taskList = document.getElementById('taskList');
        if (!taskList) return;
        
        taskList.innerHTML = '';
        
        Object.values(this.gameState.tasks).forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            let progressText = '';
            const progress = this.gameState.taskProgress;
            
            switch (task.target.type) {
                case 'plant':
                    const planted = progress.plant[task.target.item] || 0;
                    progressText = `${planted}/${task.target.count}`;
                    break;
                case 'water':
                    progressText = `${progress.water}/${task.target.count}`;
                    break;
                case 'harvest':
                    progressText = `${progress.harvest}/${task.target.count}`;
                    break;
                case 'collect':
                    const collectProgress = Object.entries(task.target.items).map(([item, count]) => {
                        const collected = progress.collect[item] || 0;
                        return `${ITEM_NAMES[item]}: ${collected}/${count}`;
                    }).join(', ');
                    progressText = collectProgress;
                    break;
                case 'kill':
                    progressText = `${progress.kill}/${task.target.count}`;
                    break;
                case 'craft':
                    const craftProgress = Object.entries(task.target.items).map(([item, count]) => {
                        const crafted = progress.craft[item] || 0;
                        return `${ITEM_NAMES[item]}: ${crafted}/${count}`;
                    }).join(', ');
                    progressText = craftProgress;
                    break;
            }
            
            taskItem.innerHTML = `
                <div class="task-name">${task.name}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-progress">${progressText}</div>
                <div class="task-reward">奖励: ${task.reward.gold}金币 ${task.reward.exp}经验</div>
            `;
            
            taskList.appendChild(taskItem);
        });
    }

    updateEquipmentUI() {
        ['weapon', 'tool', 'accessory'].forEach(slot => {
            const item = this.gameState.equipment[slot];
            const slotEl = document.getElementById(`equip-${slot}`);
            if (item) {
                const icon = RECIPES[item] ? RECIPES[item].icon : '🔧';
                slotEl.innerHTML = `<div class="icon">${icon}</div><div class="label">${ITEM_NAMES[item]}</div>`;
                slotEl.classList.add('has-item');
            } else {
                const defaultIcons = { weapon: '⚔️', tool: '🛠️', accessory: '💍' };
                const defaultNames = { weapon: '武器', tool: '工具', accessory: '饰品' };
                slotEl.innerHTML = `<div class="icon">${defaultIcons[slot]}</div><div class="label">${defaultNames[slot]}</div>`;
                slotEl.classList.remove('has-item');
            }
        });
    }

    updateSeedUI() {
        const grid = document.getElementById('seedGrid');
        grid.innerHTML = '';

        Object.entries(FRUITS).forEach(([key, fruit]) => {
            const seedKey = `${key}_seed`;
            const count = this.gameState.warehouse[seedKey] || 0;

            const btn = document.createElement('button');
            btn.className = 'grid-item';
            if (this.gameState.selectedSeed === seedKey) btn.classList.add('active');
            btn.innerHTML = `${fruit.icon} ${fruit.name}种子<br>持有:${count}`;
            btn.onclick = () => {
                this.gameState.selectedSeed = seedKey;
                this.gameState.selectedTool = 'plant';
                document.getElementById('currentTool').textContent = `种植${fruit.name}`;
                this.updateSeedUI();
            };
            grid.appendChild(btn);
        });
    }

    updateShopUI() {
        const grid = document.getElementById('shopGrid');
        grid.innerHTML = '';

        Object.entries(FRUITS).forEach(([key, fruit]) => {
            const btn = document.createElement('button');
            btn.className = 'grid-item';
            btn.innerHTML = `出售${fruit.icon}<br>${fruit.sellPrice}金币`;
            btn.onclick = () => {
                if (this.inventorySystem.hasItem(key, 1)) {
                    this.inventorySystem.removeItem(key, 1);
                    this.gameState.gold += fruit.sellPrice;
                    this.addLog(`出售了${fruit.name}，获得${fruit.sellPrice}金币`, 'success');
                    this.updateUI();
                }
            };
            if (!this.inventorySystem.hasItem(key, 1)) btn.classList.add('disabled');
            grid.appendChild(btn);
        });

        Object.entries(FRUITS).forEach(([key, fruit]) => {
            const btn = document.createElement('button');
            btn.className = 'grid-item';
            btn.innerHTML = `购买${fruit.icon}种子<br>${fruit.buyPrice}金币`;
            btn.onclick = () => {
                if (this.gameState.gold >= fruit.buyPrice) {
                    this.gameState.gold -= fruit.buyPrice;
                    this.inventorySystem.addItem(`${key}_seed`, 1);
                    this.addLog(`购买了${fruit.name}种子`, 'success');
                    this.updateUI();
                }
            };
            if (this.gameState.gold < fruit.buyPrice) btn.classList.add('disabled');
            grid.appendChild(btn);
        });
    }

    updateCraftUI() {
        const grid = document.getElementById('craftGrid');
        grid.innerHTML = '';

        Object.entries(RECIPES).forEach(([key, recipe]) => {
            const btn = document.createElement('button');
            btn.className = 'grid-item';

            let materialText = '';
            const canCraft = Object.entries(recipe.materials).every(([mat, count]) => {
                const hasCount = this.gameState.warehouse[mat] || 0;
                materialText += `${ITEM_NAMES[mat]}:${hasCount}/${count} `;
                return hasCount >= count;
            });

            btn.innerHTML = `${recipe.icon} ${recipe.name}<br>${materialText}`;
            btn.onclick = () => {
                if (canCraft) {
                    this.craftSystem.craft(key);
                    this.updateUI();
                }
            };
            if (!canCraft) btn.classList.add('disabled');
            grid.appendChild(btn);
        });
    }

    updateWarehouseUI() {
        const content = document.getElementById('warehouseContent');
        const items = Object.entries(this.gameState.warehouse).filter(([key, count]) => count > 0 && !key.includes('water'));

        if (items.length === 0) {
            content.innerHTML = '<div class="warehouse-item empty">仓库是空的</div>';
            return;
        }

        content.innerHTML = '';
        items.forEach(([key, count]) => {
            const div = document.createElement('div');
            div.className = 'warehouse-item';

            let icon = '';
            if (FRUITS[key]) icon = FRUITS[key].icon;
            else if (RECIPES[key]) icon = RECIPES[key].icon;
            else if (key === 'wood') icon = '🪵';
            else if (key === 'stone') icon = '🪨';
            else if (key === 'iron') icon = '⛓️';
            else if (key.includes('seed')) {
                const fruitType = key.replace('_seed', '');
                if (FRUITS[fruitType]) icon = FRUITS[fruitType].icon;
            }

            div.innerHTML = `<span>${icon} ${ITEM_NAMES[key] || key}</span><span>${count}</span>`;
            div.onclick = () => this.handleWarehouseClick(key);
            content.appendChild(div);
        });
    }

    handleWarehouseClick(item) {
        if (RECIPES[item]) {
            const recipe = RECIPES[item];
            
            // 先卸下当前装备
            if (this.gameState.equipment[recipe.type]) {
                const oldItem = this.gameState.equipment[recipe.type];
                const oldRecipe = RECIPES[oldItem];
                
                // 移除旧装备的效果
                if (oldRecipe.effect) {
                    if (oldRecipe.effect.hp) {
                        this.gameState.player.maxHp -= oldRecipe.effect.hp;
                        this.gameState.player.hp = Math.min(this.gameState.player.hp, this.gameState.player.maxHp);
                    }
                    if (oldRecipe.effect.atk) {
                        this.gameState.player.atk -= oldRecipe.effect.atk;
                    }
                }
                
                this.inventorySystem.addItem(oldItem, 1);
                this.addLog(`卸下了${oldRecipe.name}`, 'info');
            }
            
            // 装备新物品
            this.gameState.equipment[recipe.type] = item;
            
            // 应用新装备的效果
            if (recipe.type === 'weapon') {
                this.gameState.player.atk = 5 + recipe.damage;
                this.addLog(`装备了${recipe.name}，攻击力+${recipe.damage}`, 'success');
            } else if (recipe.type === 'tool') {
                this.addLog(`装备了${recipe.name}`, 'success');
                
                // 处理洒水壶容量
                if (recipe.capacity) {
                    this.gameState.warehouse.wateringCan_water = recipe.capacity;
                    this.addLog(`${recipe.name}容量增加到${recipe.capacity}`, 'success');
                }
            } else if (recipe.type === 'accessory') {
                if (recipe.effect) {
                    let effectText = '';
                    if (recipe.effect.hp) {
                        this.gameState.player.maxHp += recipe.effect.hp;
                        this.gameState.player.hp += recipe.effect.hp;
                        effectText += `生命值+${recipe.effect.hp}`;
                    }
                    if (recipe.effect.atk) {
                        this.gameState.player.atk += recipe.effect.atk;
                        effectText += `攻击力+${recipe.effect.atk}`;
                    }
                    this.addLog(`装备了${recipe.name}，${effectText}`, 'success');
                }
            }
            
            this.inventorySystem.removeItem(item, 1);
            this.updateUI();
        }
    }

    showEquipMenu(slot) {
        const existingItem = this.gameState.equipment[slot];
        
        // 如果有装备，先卸下
        if (existingItem) {
            this.inventorySystem.addItem(existingItem, 1);
            this.gameState.equipment[slot] = null;
            this.addLog(`卸下了${ITEM_NAMES[existingItem]}`, 'info');
            this.updateUI();
            return;
        }
        
        // 显示可装备物品列表
        const availableItems = this.getAvailableEquipItems(slot);
        if (availableItems.length === 0) {
            const slotNames = { weapon: '武器', tool: '工具', accessory: '饰品' };
            this.addLog(`没有可装备的${slotNames[slot]}`, 'warning');
            return;
        }
        
        // 装备第一个可用物品
        const item = availableItems[0];
        this.gameState.equipment[slot] = item;
        this.inventorySystem.removeItem(item, 1);
        this.addLog(`装备了${ITEM_NAMES[item]}`, 'success');
        this.updateUI();
    }
    
    getAvailableEquipItems(slot) {
        const items = [];
        const warehouse = this.gameState.warehouse;
        
        // 工具类物品
        const tools = ['wateringCan', 'ironWateringCan', 'axe', 'ironAxe', 'pickaxe', 'ironPickaxe'];
        // 武器类物品
        const weapons = ['woodSword', 'stoneSword', 'ironSword', 'woodBow', 'ironBow'];
        // 饰品类物品
        const accessories = ['woodenRing', 'stoneRing', 'ironRing', 'woodenAmulet', 'stoneAmulet', 'ironAmulet'];
        
        let targetItems = [];
        if (slot === 'tool') targetItems = tools;
        else if (slot === 'weapon') targetItems = weapons;
        else if (slot === 'accessory') targetItems = accessories;
        
        targetItems.forEach(item => {
            if (warehouse[item] && warehouse[item] > 0) {
                items.push(item);
            }
        });
        
        return items;
    }

    addLog(message, type = 'info') {
        const log = document.getElementById('gameLog');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

let currentGameScene = null;

function openEquipMenu(slot) {
    if (!currentGameScene) return;
    currentGameScene.showEquipMenu(slot);
}
