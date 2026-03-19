class CraftSystem {
    constructor(scene) {
        this.scene = scene;
    }

    canCraft(recipeKey) {
        const recipe = RECIPES[recipeKey];
        return Object.entries(recipe.materials).every(([mat, count]) => 
            this.scene.inventorySystem.hasItem(mat, count)
        );
    }

    craft(recipeKey) {
        if (!this.canCraft(recipeKey)) {
            this.scene.addLog('材料不足', 'error');
            return false;
        }

        const recipe = RECIPES[recipeKey];

        // 消耗材料
        Object.entries(recipe.materials).forEach(([mat, count]) => {
            this.scene.inventorySystem.removeItem(mat, count);
        });

        // 添加制造物品
        this.scene.inventorySystem.addItem(recipeKey, 1);
        this.scene.addLog(`制造了${recipe.name}`, 'success');

        // 更新任务进度
        this.scene.updateTaskProgress('craft', recipeKey);
        
        // 播放音效
        this.scene.playSound('craft');

        return true;
    }
}
