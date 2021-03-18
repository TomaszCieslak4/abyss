import { Camera } from "../core/camera.js";
import { GameObject } from "../core/gameObject.js";
import { Collision } from "../physics/rigidbody.js";

export class Script {
    constructor(public gameObject: GameObject) { }
    update() { }
    fixedUpdate() { }
    start() { }
    draw(context: CanvasRenderingContext2D, cam: Camera) { }
    onCollisionEnter(collision: Collision) { }
    onTriggerEnter(collision: Collision) { }
}

