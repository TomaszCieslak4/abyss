import { Tween } from "./tween.js";
import { lerp } from "./util.js";
export class NumberTween extends Tween {
    constructor(duration = 0, inital = 0) {
        super(duration);
        this.startValue = 0;
        this._immediate = 0;
        this.startValue = inital;
        this._immediate = inital;
        this.elapsedTime = duration;
    }
    get immediate() { return this._immediate; }
    set immediate(value) {
        this._immediate = value;
        this.elapsedTime = this.duration;
        this.startValue = this._immediate;
    }
    get value() { return lerp(this.startValue, this._immediate, this.elapsedTime / this.duration); }
    set value(value) { this.startValue = this.value; this.elapsedTime = 0; this._immediate = value; }
}
