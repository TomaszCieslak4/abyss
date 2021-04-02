import { Health } from "./health.js";
import { Interactable } from "./interactable.js";
import { Player } from "./player.js";

export class HealthPack extends Interactable {
    interact(player: Player) {
        let health = player.gameObject.getComponent(Health);
        if (health) {
            health.health = health.maxHealth;
            return super.interact(player);
        }
        return false;
    }
}