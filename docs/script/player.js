import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
export class Player extends Script {
    constructor() {
        super(...arguments);
        this.weapon = null;
    }
    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody);
    }
}
