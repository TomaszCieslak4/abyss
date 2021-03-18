import { Camera } from "../core/camera.js";
import { GameObject } from "../core/gameObject.js";
import { Collider } from "../physics/collider.js";
import { Collision } from "../physics/rigidbody.js";

export class Script {
    constructor(public gameObject: GameObject) { }
    update() { }
    fixedUpdate() { }
    start() { }
    draw(context: CanvasRenderingContext2D, cam: Camera) { }
    onCollisionEnter(collision: Collision) { }
    onTriggerEnter(collision: Collision) { }
    onCollisionStay(collision: Collision) { }
    onTriggerStay(collision: Collision) { }
    onCollisionExit(collider: Collider) { }
    onTriggerExit(collider: Collider) { }
}

