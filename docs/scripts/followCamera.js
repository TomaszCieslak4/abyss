import { Script } from "../engine/core/script.js";
import { Vec2 } from "../engine/util/vector.js";
export class FollowCamera extends Script {
    fixedUpdate() {
        this.gameObject.transform.position = Vec2.lerp(this.gameObject.transform.position, this.player.transform.position, 0.05);
    }
}
