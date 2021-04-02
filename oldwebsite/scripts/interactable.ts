import { GameObject } from "../engine/core/gameObject.js";
import { Collider } from "../engine/physics/collider.js";
import { Collision } from "../engine/physics/rigidbody.js";
import { Player } from "./player.js";
import { Script } from "../engine/core/script.js";
import { Time } from "../engine/util/time.js";
import { Vec2 } from "../engine/util/vector.js";
import { DeathAnimator } from "./deathAnimator.js";

export class Interactable extends Script {
    used: boolean = false;

    interact(player: Player): boolean {
        if (!this.used) {
            this.used = true;
            this.gameObject.addComponent(DeathAnimator);
            return true;
        }
        return false;
    }
}