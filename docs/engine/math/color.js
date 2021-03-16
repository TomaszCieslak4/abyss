import { lerp } from "../util.js";
export class Color {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    lerp(x, t) {
        return new Color(lerp(this.r, x.r, t), lerp(this.g, x.g, t), lerp(this.b, x.b, t), lerp(this.a, x.a, t));
    }
    toColorString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}
