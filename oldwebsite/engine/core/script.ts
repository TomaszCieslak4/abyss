import { Camera } from "./camera.js";
import { GameObject } from "./gameObject.js";
import { Collider } from "../physics/collider.js";
import { Collision } from "../physics/rigidbody.js";

export class Script {
    enabled: boolean = true;
    constructor(public gameObject: GameObject) { }
    update() { }
    fixedUpdate() { }
    start() { }
    onCollisionEnter(collision: Collision) { }
    onTriggerEnter(collision: Collision) { }
    onCollisionStay(collision: Collision) { }
    onTriggerStay(collision: Collision) { }
    onCollisionExit(collider: Collider, gameObject: GameObject) { }
    onTriggerExit(collider: Collider, gameObject: GameObject) { }
    onDestroy() { }
}

