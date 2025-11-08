import ElementAction from "../element_action.js";
import Player from "../../game/player.js";
import Element from "../element.js";
import Resource from "../../game/resource.js";
import {displayRightClick} from "../../view/render.js";

export default class ActionPruneVegetation extends ElementAction {
    constructor() {
        super();
    }

    executor(square) {
        console.log("ActionPruneVegetation executor called");
        
        // Get all images in the square
        const imgs = square.querySelectorAll('img');
        console.log("Found images:", imgs.length, Array.from(imgs).map(img => img.id));
        
        // Skip if only ground is present
        if (imgs.length <= 1) {
            console.log("No vegetation to prune - only ground present");
            return;
        }

        // Get the top element (vegetation)
        const topImg = imgs[1];
        const elementId = topImg.getAttribute("id");
        console.log("Top element ID:", elementId);

        // Check if it's vegetation that can be pruned
        if (this.isVegetation(elementId)) {
            console.log("Element is vegetation, proceeding to prune");
            
            // Give appropriate reward based on element type
            const reward = this.getReward(elementId);
            console.log("Reward:", reward);
            
            if (reward.resource && reward.amount > 0) {
                reward.resource.updateQuantity(reward.amount);
                displayRightClick("+" + reward.amount, reward.resource.getImage(), 
                    Player.player.getMouseX() + 40, Player.player.getMouseY());
            }

            // Remove the vegetation
            topImg.remove();
            
            console.log(`Pruned ${elementId}, got ${reward.amount} ${reward.resource ? reward.resource.displayName : 'nothing'}`);
        } else {
            console.log(`Cannot prune ${elementId} - not vegetation`);
        }
    }

    /**
     * Check if an element is vegetation that can be pruned
     */
    isVegetation(elementId) {
        const vegetationTypes = [
            'tree0', 'tree1', 'bosque_tree',  // Trees
            'plant0',                          // Plants/bushes
            'flower0', 'flower1', 'flower2', 'bosque_flower', // Flowers
            'trunk0'                           // Tree stumps
        ];
        
        return vegetationTypes.includes(elementId);
    }

    /**
     * Get reward for pruning specific vegetation
     */
    getReward(elementId) {
        const woodResource = Resource.getResource("wood");
        const leafResource = Resource.getResource("leaf"); 
        const seedResource = Resource.getResource("seed0");

        switch(elementId) {
            case 'tree0':
            case 'tree1':
            case 'bosque_tree':
                return { resource: woodResource, amount: 5 };
            
            case 'trunk0':
                return { resource: woodResource, amount: 2 };
                
            case 'plant0':
                return { resource: leafResource, amount: 3 };
                
            case 'flower0':
            case 'flower1': 
            case 'flower2':
            case 'bosque_flower':
                return { resource: seedResource, amount: 2 };
                
            default:
                return { resource: null, amount: 0 };
        }
    }
}
