import { Script } from "./script.js";
import { Vec2 } from "../util/vector.js";
export class FollowCamera extends Script {
    update() {
        this.gameObject.transform.position = Vec2.lerp(this.gameObject.transform.position, this.player.transform.position.sub(this.gameObject.transform.scale.div_s(2)).add(this.player.transform.scale.div_s(2)), 0.02);
    }
}
