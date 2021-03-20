import { Script } from "../engine/core/script.js";
import { DeathAnimator } from "./deathAnimator.js";
export class Interactable extends Script {
    constructor() {
        super(...arguments);
        this.used = false;
    }
    interact(player) {
        if (!this.used) {
            this.used = true;
            this.gameObject.addComponent(DeathAnimator);
            return true;
        }
        return false;
    }
}
