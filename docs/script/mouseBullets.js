import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
export class MouseBullet extends Script {
    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody);
    }
    fixedUpdate() {
        // this.rigidBody.velocity = Vec2.lerp(this.rigidBody.velocity, this.gameObject.transform.position.sub(Camera.main.viewportToWorld().mul_vec2(Input.mousePos)).normalize().mul_s(-10), 0.2);
    }
    onCollisionEnter() {
        this.gameObject.destroy(this.gameObject);
    }
}
