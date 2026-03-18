class InventorySystem {
    constructor(scene) {
        this.scene = scene;
    }

    addItem(item, count) {
        if (!this.scene.gameState.warehouse[item]) {
            this.scene.gameState.warehouse[item] = 0;
        }
        this.scene.gameState.warehouse[item] += count;
    }

    removeItem(item, count) {
        if (this.scene.gameState.warehouse[item]) {
            this.scene.gameState.warehouse[item] -= count;
            if (this.scene.gameState.warehouse[item] <= 0) {
                delete this.scene.gameState.warehouse[item];
            }
        }
    }

    hasItem(item, count) {
        return (this.scene.gameState.warehouse[item] || 0) >= count;
    }

    getItemCount(item) {
        return this.scene.gameState.warehouse[item] || 0;
    }
}
