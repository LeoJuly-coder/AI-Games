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
        this.updateUI();
        this.addLog('欢迎来到像素农场！', 'info');
        this.addLog('WASD移动，走到树枝🌿碎石🪨上自动拾取', 'info');
    }

    initGameState() {
        this.gameState = {
            player: { hp: 100, maxHp: 100, atk: 5, facing: 'down' },
            selectedTool: null,
            selectedSeed: null,
            warehouse: { strawberry_seed: 3, wateringCan: 1, wateringCan_water: 5 },
            equipment: { weapon: null, tool: null, accessory: null },
            gold: 50,
            map: []
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
                this.removeResourceAt(newX, newY);
                return;
            }
        }

        // 检查碰撞
        if (cell.type === 'well' || cell.type === 'resource') return;

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
        this.addLog(`你攻击了${monster.name}，造成${damage}点伤害`, 'info');

        if (monster.hp <= 0) {
            const drops = MONSTERS[monster.type].drops;
            Object.entries(drops).forEach(([item, count]) => {
                this.inventorySystem.addItem(item, count);
                this.addLog(`获得 ${ITEM_NAMES[item]} x${count}`, 'loot');
            });
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

            if (dist <= 1) {
                // 攻击玩家
                const damage = MONSTERS[monster.type].damage;
                this.gameState.player.hp -= damage;
                this.addLog(`${monster.name}攻击了你，受到${damage}点伤害！`, 'error');
                this.updateUI();

                if (this.gameState.player.hp <= 0) {
                    this.gameState.player.hp = 0;
                    this.addLog('你被击败了！游戏结束', 'error');
                }
            } else if (Math.random() < 0.3) {
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

                if (this.canMoveTo(newX, newY)) {
                    monster.moveTo(newX, newY);
                }
            }
        });
    }

    trySpawnMonster() {
        if (this.monsterGroup.getLength() >= 3) return;
        if (Math.random() > 0.3) return;

        const types = Object.keys(MONSTERS);
        const type = types[Phaser.Math.Between(0, types.length - 1)];

        for (let attempts = 0; attempts < 20; attempts++) {
            const x = Phaser.Math.Between(0, GameConfig.MAP_SIZE - 1);
            const y = Phaser.Math.Between(0, GameConfig.MAP_SIZE - 1);

            const dist = Math.sqrt(Math.pow(x - this.player.gridX, 2) + Math.pow(y - this.player.gridY, 2));
            if (dist > 5 && this.canMoveTo(x, y)) {
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
        if (!this.gameState.selectedTool) {
            this.addLog('请先选择一个工具', 'warning');
            return;
        }

        const x = this.player.gridX;
        const y = this.player.gridY;
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
        cell.crop = {
            type: this.gameState.selectedSeed.replace('_seed', ''),
            stage: 0,
            watered: false,
            fertilized: false,
            growthTime: Date.now() + GameConfig.STAGE_TIME
        };

        const crop = new Crop(this, x, y, cell.crop.type, 0);
        crop.setWatered(false);
        this.add.existing(crop);
        this.cropGroup.add(crop);

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

        this.updateEquipmentUI();
        this.updateSeedUI();
        this.updateShopUI();
        this.updateCraftUI();
        this.updateWarehouseUI();
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
            if (recipe.type === 'weapon') {
                if (this.gameState.equipment.weapon) {
                    this.inventorySystem.addItem(this.gameState.equipment.weapon, 1);
                }
                this.gameState.equipment.weapon = item;
                this.gameState.player.atk = 5 + recipe.damage;
                this.inventorySystem.removeItem(item, 1);
                this.addLog(`装备了${recipe.name}，攻击力+${recipe.damage}`, 'success');
            } else if (recipe.type === 'tool') {
                if (this.gameState.equipment.tool) {
                    this.inventorySystem.addItem(this.gameState.equipment.tool, 1);
                }
                this.gameState.equipment.tool = item;
                this.inventorySystem.removeItem(item, 1);
                this.addLog(`装备了${recipe.name}`, 'success');
            }
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
        const tools = ['wateringCan', 'axe', 'pickaxe'];
        // 武器类物品
        const weapons = ['sword', 'iron_sword'];
        // 饰品类物品
        const accessories = ['ring', 'amulet'];
        
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
