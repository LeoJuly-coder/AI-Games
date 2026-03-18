const FRUITS = {
    strawberry: { name: '草莓', icon: '🍓', buyPrice: 10, sellPrice: 25, color: '#ff6b6b' },
    apple: { name: '苹果', icon: '🍎', buyPrice: 25, sellPrice: 60, color: '#e74c3c' },
    orange: { name: '橙子', icon: '🍊', buyPrice: 50, sellPrice: 120, color: '#f39c12' },
    grape: { name: '葡萄', icon: '🍇', buyPrice: 100, sellPrice: 250, color: '#9b59b6' },
    peach: { name: '桃子', icon: '🍑', buyPrice: 200, sellPrice: 500, color: '#ff9ff3' }
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
    axe: { name: '斧头', icon: '🪓', type: 'tool', materials: { stone: 2, wood: 1 } },
    pickaxe: { name: '镐子', icon: '⛏️', type: 'tool', materials: { stone: 1, wood: 2 } },
    woodSword: { name: '木剑', icon: '🗡️', type: 'weapon', materials: { wood: 3 }, damage: 10 },
    stoneSword: { name: '石剑', icon: '⚔️', type: 'weapon', materials: { wood: 2, stone: 3 }, damage: 20 },
    woodBow: { name: '木弓', icon: '🏹', type: 'weapon', materials: { wood: 5 }, damage: 15 },
    ironSword: { name: '铁剑', icon: '🗡️', type: 'weapon', materials: { wood: 2, iron: 3 }, damage: 35 }
};

const MONSTERS = {
    slime: { name: '史莱姆', icon: '🟢', hp: 10, damage: 5, drops: { slime_gel: 1, coin: 2 }, speed: 30 },
    goblin: { name: '哥布林', icon: '👺', hp: 25, damage: 8, drops: { goblin_ear: 1, coin: 3, wood: 1 }, speed: 40 },
    skeleton: { name: '骷髅', icon: '💀', hp: 40, damage: 12, drops: { bone: 1, coin: 4, stone: 1 }, speed: 35 },
    orc: { name: '兽人', icon: '👹', hp: 60, damage: 15, drops: { orc_tooth: 1, coin: 5, iron: 1 }, speed: 25 }
};

const ITEM_NAMES = {
    wood: '木头', stone: '石头', iron: '铁矿',
    slime_gel: '史莱姆凝胶', goblin_ear: '哥布林耳朵', bone: '骨头', orc_tooth: '兽人牙齿', coin: '硬币',
    strawberry_seed: '草莓种子', apple_seed: '苹果种子', orange_seed: '橙子种子',
    grape_seed: '葡萄种子', peach_seed: '桃子种子',
    wateringCan: '洒水壶',
    strawberry: '草莓', apple: '苹果', orange: '橙子', grape: '葡萄', peach: '桃子',
    axe: '斧头', pickaxe: '镐子', woodSword: '木剑', stoneSword: '石剑', woodBow: '木弓', ironSword: '铁剑'
};

const TOOL_ICONS = {
    plant: '🌱', water: '💧', fertilize: '⚡', harvest: '🧺',
    axe: '🪓', pickaxe: '⛏️', sword: '⚔️', fillWater: '🚰'
};

const TOOL_NAMES = {
    plant: '种植', water: '浇水', fertilize: '施肥', harvest: '收获',
    axe: '斧头', pickaxe: '镐子', sword: '武器', fillWater: '打水'
};
