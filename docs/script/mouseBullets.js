import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
export class MouseBullet extends Script {
    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody);
    }
}
