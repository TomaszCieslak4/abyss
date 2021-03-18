import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
import { Vec2 } from "../util/vector.js";
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
        this.rigidBody.velocity = new Vec2(Input.getAxis("x") * 500, Input.getAxis("y") * 500);
        // this.gameObject.transform.rotation += Math.PI / 6 * Time.deltaTime;
        if (Input.getButton("fire")) {
            (_a = this.weapon) === null || _a === void 0 ? void 0 : _a.shoot();
        }
    }
}
