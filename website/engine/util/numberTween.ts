import { Tween } from "./tween.js";
import { lerp } from "./util.js";

export class NumberTween extends Tween {
    private startValue: number = 0;
    private _immediate: number = 0;
    public get immediate(): number { return this._immediate; }
    public set immediate(value: number) {
        this._immediate = value;
        this.elapsedTime = this.duration;
        this.startValue = this._immediate;
    }
    public get value(): number { return lerp(this.startValue, this._immediate, this.elapsedTime / this.duration); }
    public set value(value: number) { this.startValue = this.value; this.elapsedTime = 0; this._immediate = value; }

    constructor(duration: number = 0, inital: number = 0) {
        super(duration);
        this.startValue = inital;
        this._immediate = inital;
        this.elapsedTime = duration;
    }
}