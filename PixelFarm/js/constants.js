const FRUITS = {
    strawberry: { name: '草莓', icon: '🍓', buyPrice: 10, sellPrice: 25, color: '#ff6b6b', growthTime: 6000 },
    apple: { name: '苹果', icon: '🍎', buyPrice: 25, sellPrice: 60, color: '#e74c3c', growthTime: 10000 },
    orange: { name: '橙子', icon: '🍊', buyPrice: 50, sellPrice: 120, color: '#f39c12', growthTime: 15000 },
    grape: { name: '葡萄', icon: '🍇', buyPrice: 100, sellPrice: 250, color: '#9b59b6', growthTime: 20000 },
    peach: { name: '桃子', icon: '🍑', buyPrice: 200, sellPrice: 500, color: '#ff9ff3', growthTime: 25000 },
    // 新增蔬菜
    carrot: { name: '胡萝卜', icon: '🥕', buyPrice: 8, sellPrice: 20, color: '#e67e22', growthTime: 5000 },
    potato: { name: '土豆', icon: '🥔', buyPrice: 12, sellPrice: 30, color: '#95a5a6', growthTime: 7000 },
    tomato: { name: '番茄', icon: '🍅', buyPrice: 15, sellPrice: 40, color: '#e74c3c', growthTime: 8000 },
    // 新增谷物
    wheat: { name: '小麦', icon: '🌾', buyPrice: 5, sellPrice: 15, color: '#f1c40f', growthTime: 9000 },
    corn: { name: '玉米', icon: '🌽', buyPrice: 20, sellPrice: 50, color: '#f39c12', growthTime: 12000 }
};

const RESOURCES = {
    twig: { name: '树枝', icon: '🌿', hp: 1, drops: { wood: 1 }, tool: null },
    stone_small: { name: '碎石', icon: '🪨', hp: 1, drops: { stone: 1 }, tool: null },
    tree_small: { name: '小树', icon: '🌳', hp: 3, drops: { wood: 3 }, tool: 'axe' },
    tree_medium: { name: '中树', icon: '🌲', hp: 5, drops: { wood: 5 }, tool: 'axe' },
    tree_large: { name: '大树', icon: '🎄', hp: 8, drops: { wood: 10 }, tool: 'axe' },
    rock_small: { name: '小岩石', icon: '🪨', hp: 3, drops: { stone: 3 }, tool: 'pickaxe' },
    rock_medium: { name: '中岩石', icon: '⛰️', hp: 5, drops: { stone: 5 }, tool: 'pickaxe' },
    rock_large: { name: '大岩石', icon: '🗿', hp: 8, drops: { stone: 10, iron: 1 }, tool: 'pickaxe' }
};

const RECIPES = {
    // 工具类
    axe: { name: '斧头', icon: '🪓', type: 'tool', materials: { stone: 2, wood: 1 } },
    ironAxe: { name: '铁斧', icon: '🪓', type: 'tool', materials: { iron: 2, wood: 1 }, efficiency: 2 },
    pickaxe: { name: '镐子', icon: '⛏️', type: 'tool', materials: { stone: 1, wood: 2 } },
    ironPickaxe: { name: '铁镐', icon: '⛏️', type: 'tool', materials: { iron: 1, wood: 2 }, efficiency: 2 },
    wateringCan: { name: '洒水壶', icon: '🚿', type: 'tool', materials: { wood: 1, stone: 1 } },
    ironWateringCan: { name: '铁洒水壶', icon: '🚿', type: 'tool', materials: { wood: 1, iron: 1 }, capacity: 20 },
    
    // 武器类
    woodSword: { name: '木剑', icon: '🗡️', type: 'weapon', materials: { wood: 3 }, damage: 10 },
    stoneSword: { name: '石剑', icon: '⚔️', type: 'weapon', materials: { wood: 2, stone: 3 }, damage: 20 },
    ironSword: { name: '铁剑', icon: '🗡️', type: 'weapon', materials: { wood: 2, iron: 3 }, damage: 35 },
    woodBow: { name: '木弓', icon: '🏹', type: 'weapon', materials: { wood: 5 }, damage: 15 },
    ironBow: { name: '铁弓', icon: '🏹', type: 'weapon', materials: { wood: 3, iron: 2 }, damage: 25 },
    
    // 饰品类
    woodenRing: { name: '木戒指', icon: '💍', type: 'accessory', materials: { wood: 2 }, effect: { hp: 5 } },
    stoneRing: { name: '石戒指', icon: '💍', type: 'accessory', materials: { stone: 2 }, effect: { hp: 10 } },
    ironRing: { name: '铁戒指', icon: '�', type: 'accessory', materials: { iron: 2 }, effect: { hp: 15 } },
    woodenAmulet: { name: '木护符', icon: '🔯', type: 'accessory', materials: { wood: 3 }, effect: { atk: 2 } },
    stoneAmulet: { name: '石护符', icon: '🔯', type: 'accessory', materials: { stone: 3 }, effect: { atk: 4 } },
    ironAmulet: { name: '铁护符', icon: '🔯', type: 'accessory', materials: { iron: 3 }, effect: { atk: 6 } }
};

const MONSTERS = {
    // 基础怪物
    slime: { name: '史莱姆', icon: '🟢', hp: 10, damage: 5, drops: { slime_gel: 1, coin: 2 }, speed: 30, level: 1 },
    goblin: { name: '哥布林', icon: '👺', hp: 25, damage: 8, drops: { goblin_ear: 1, coin: 3, wood: 1 }, speed: 40, level: 2 },
    skeleton: { name: '骷髅', icon: '💀', hp: 40, damage: 12, drops: { bone: 1, coin: 4, stone: 1 }, speed: 35, level: 3 },
    orc: { name: '兽人', icon: '👹', hp: 60, damage: 15, drops: { orc_tooth: 1, coin: 5, iron: 1 }, speed: 25, level: 4 },
    
    // 新增怪物
    bat: { name: '蝙蝠', icon: '🦇', hp: 15, damage: 6, drops: { bat_wing: 1, coin: 2 }, speed: 50, level: 1, flying: true },
    spider: { name: '蜘蛛', icon: '🕷️', hp: 20, damage: 7, drops: { spider_leg: 1, coin: 3 }, speed: 45, level: 2, poison: true },
    wolf: { name: '狼', icon: '🐺', hp: 35, damage: 10, drops: { wolf_fur: 1, coin: 4, meat: 1 }, speed: 55, level: 3 },
    bear: { name: '熊', icon: '🐻', hp: 80, damage: 18, drops: { bear_pelt: 1, coin: 6, meat: 2 }, speed: 30, level: 5 },
    dragon: { name: '幼龙', icon: '🐉', hp: 120, damage: 25, drops: { dragon_scale: 1, coin: 10, iron: 2 }, speed: 20, level: 6, fire: true }
};

const ITEM_NAMES = {
    wood: '木头', stone: '石头', iron: '铁矿',
    slime_gel: '史莱姆凝胶', goblin_ear: '哥布林耳朵', bone: '骨头', orc_tooth: '兽人牙齿', coin: '硬币',
    bat_wing: '蝙蝠翅膀', spider_leg: '蜘蛛腿', wolf_fur: '狼皮', bear_pelt: '熊皮', dragon_scale: '龙鳞', meat: '肉',
    strawberry_seed: '草莓种子', apple_seed: '苹果种子', orange_seed: '橙子种子',
    grape_seed: '葡萄种子', peach_seed: '桃子种子',
    carrot_seed: '胡萝卜种子', potato_seed: '土豆种子', tomato_seed: '番茄种子',
    wheat_seed: '小麦种子', corn_seed: '玉米种子',
    wateringCan: '洒水壶', ironWateringCan: '铁洒水壶',
    strawberry: '草莓', apple: '苹果', orange: '橙子', grape: '葡萄', peach: '桃子',
    carrot: '胡萝卜', potato: '土豆', tomato: '番茄', wheat: '小麦', corn: '玉米',
    axe: '斧头', ironAxe: '铁斧', pickaxe: '镐子', ironPickaxe: '铁镐',
    woodSword: '木剑', stoneSword: '石剑', ironSword: '铁剑', woodBow: '木弓', ironBow: '铁弓',
    woodenRing: '木戒指', stoneRing: '石戒指', ironRing: '铁戒指',
    woodenAmulet: '木护符', stoneAmulet: '石护符', ironAmulet: '铁护符'
};

const TOOL_ICONS = {
    plant: '🌱', water: '💧', fertilize: '⚡', harvest: '🧺',
    axe: '🪓', pickaxe: '⛏️', sword: '⚔️', fillWater: '🚰'
};

const TOOL_NAMES = {
    plant: '种植', water: '浇水', fertilize: '施肥', harvest: '收获',
    axe: '斧头', pickaxe: '镐子', sword: '武器', fillWater: '打水'
};

// 任务系统
const TASKS = {
    // 新手任务
    task_1: {
        id: 'task_1',
        name: '初次种植',
        description: '种植5颗草莓种子',
        target: { type: 'plant', item: 'strawberry_seed', count: 5 },
        reward: { gold: 50, exp: 20 },
        completed: false
    },
    task_2: {
        id: 'task_2',
        name: '浇水能手',
        description: '给作物浇水10次',
        target: { type: 'water', count: 10 },
        reward: { gold: 75, exp: 30 },
        completed: false
    },
    task_3: {
        id: 'task_3',
        name: '收获季节',
        description: '收获10个果实',
        target: { type: 'harvest', count: 10 },
        reward: { gold: 100, exp: 40 },
        completed: false
    },
    task_4: {
        id: 'task_4',
        name: '资源采集',
        description: '收集20个木头和10个石头',
        target: { type: 'collect', items: { wood: 20, stone: 10 } },
        reward: { gold: 150, exp: 50 },
        completed: false
    },
    task_5: {
        id: 'task_5',
        name: '怪物猎人',
        description: '击败5个怪物',
        target: { type: 'kill', count: 5 },
        reward: { gold: 200, exp: 60 },
        completed: false
    },
    // 进阶任务
    task_6: {
        id: 'task_6',
        name: '装备制造',
        description: '制造一把斧头和一把镐子',
        target: { type: 'craft', items: { axe: 1, pickaxe: 1 } },
        reward: { gold: 250, exp: 70 },
        completed: false
    },
    task_7: {
        id: 'task_7',
        name: '高级种植',
        description: '种植5颗葡萄种子',
        target: { type: 'plant', item: 'grape_seed', count: 5 },
        reward: { gold: 300, exp: 80 },
        completed: false
    },
    task_8: {
        id: 'task_8',
        name: '战斗大师',
        description: '击败10个怪物',
        target: { type: 'kill', count: 10 },
        reward: { gold: 350, exp: 90 },
        completed: false
    }
};
