import { Script } from "../engine/core/script.js";
import { GameObject } from "../engine/core/gameObject.js";
import { Vec2 } from "../engine/util/vector.js";

export class FollowCamera extends Script {
    public player!: GameObject;

    fixedUpdate() {
        this.gameObject.transform.position = Vec2.lerp(this.gameObject.transform.position, this.player.transform.position, 0.05);
    }
}