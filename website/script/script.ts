import { Camera } from "../core/camera.js";
import { GameObject } from "../core/gameObject.js";

export class Script {
    constructor(public gameObject: GameObject) { }
    update() { }
    fixedUpdate() { }
    start() { }
    draw(context: CanvasRenderingContext2D, cam: Camera) { }
    onCollisionEnter(other: GameObject) { }
}