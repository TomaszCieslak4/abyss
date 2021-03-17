import { Script } from "../script/script.js";
import { Time } from "../util/time.js";
import { Vec2 } from "../util/vector.js";

export class RigidBody extends Script {
    velocity: Vec2 = Vec2.zero();

    fixedUpdate() {
        this.gameObject.transform.position = this.gameObject.transform.position.add(this.velocity.mul_s(Time.fixedDeltaTime));
    }
}