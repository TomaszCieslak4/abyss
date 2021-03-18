import { Camera } from "../core/camera.js";
import { Input } from "../util/input.js";
import { Vec2 } from "../util/vector.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Transform } from "../core/transform.js";
import { Script } from "./script.js";

export class MouseBullet extends Script {
    private rigidBody!: RigidBody;

    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody)!;
    }

    // fixedUpdate() {
    //     this.rigidBody.velocity = Vec2.lerp(this.rigidBody.velocity, this.gameObject.transform.position.sub(Camera.main.toWorld(Input.mousePos)).normalize().mul_s(-800), 0.2);
    // }
}