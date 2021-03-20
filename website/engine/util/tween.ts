import { Time } from "./time.js";

export class Tween {
    protected elapsedTime: number = 0;

    constructor(public duration: number = 1) { }

    update() {
        this.elapsedTime += Time.deltaTime;
        if (this.elapsedTime >= this.duration) this.elapsedTime = this.duration;
    }
}