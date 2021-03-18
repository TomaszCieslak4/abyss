import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
import { Vec2 } from "../util/vector.js";
import { Camera } from "../core/camera.js";
export class Player extends Script {
    constructor() {
        super(...arguments);
        this.weapon = null;
    }
    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody);
    }
    update() {
        var _a;
        this.rigidBody.velocity = new Vec2(Input.getAxis("x") * 10, -Input.getAxis("y") * 10);
        let direction = this.gameObject.transform.position.sub(Camera.main.viewportToWorld().mul_vec2(Input.mousePos)).mul_s(-1).normalize();
        this.gameObject.transform.forward = direction;
        if (Input.getButton("fire")) {
            (_a = this.weapon) === null || _a === void 0 ? void 0 : _a.shoot();
        }
    }
}
