import { Time } from "./time.js";
export class Tween {
    constructor(duration = 1) {
        this.duration = duration;
        this.elapsedTime = 0;
    }
    update() {
        this.elapsedTime += Time.deltaTime;
        if (this.elapsedTime >= this.duration)
            this.elapsedTime = this.duration;
    }
}
