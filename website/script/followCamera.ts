import { Script } from "./script.js";
import { GameObject } from "../core/gameObject.js";
import { Vec2 } from "../util/vector.js";

export class FollowCamera extends Script {
    public player!: GameObject;

    fixedUpdate() {
        this.gameObject.transform.position = Vec2.lerp(this.gameObject.transform.position, this.player.transform.position, 0.05);
    }
}