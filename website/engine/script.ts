import { GameObject } from "./gameObject.js";

export class Script {
    constructor(public gameObject: GameObject) { }
    update() { }
    fixedUpdate() { }
    start() { }
    draw() { }
}