import { lerp } from "../util.js";

export class Color {
    constructor(public r: number = 0, public g: number = 0, public b: number = 0, public a: number = 1) { }

    lerp(x: Color, t: number) {
        return new Color(lerp(this.r, x.r, t), lerp(this.g, x.g, t), lerp(this.b, x.b, t), lerp(this.a, x.a, t));
    }

    toColorString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}