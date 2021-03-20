import { lerp } from "./util.js";
export class Color {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    static lerp(start, end, t) {
        return new Color(lerp(start.r, end.r, t), lerp(start.g, end.g, t), lerp(start.b, end.b, t), lerp(start.a, end.a, t));
    }
    toColorString(context) {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}
