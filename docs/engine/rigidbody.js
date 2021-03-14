import { Script } from "./script.js";
import { Time } from "./time.js";
import { Vec2 } from "./vector.js";
export class RigidBody extends Script {
    constructor() {
        super(...arguments);
        this.velocity = Vec2.zero();
    }
    // friction: number = 0.002;
    // acceleration: Vec2 = Vec2.zero();
    start() {
    }
    fixedUpdate() {
        // this.velocity.i_mul_s(1 - this.friction);
        this.gameObject.transform.position.i_add(this.velocity.mul_s(Time.fixedDeltaTime));
        // this.velocity.i_add(this.acceleration.mul_s(Time.fixedDeltaTime));
    }
}
