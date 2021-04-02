import { lerp } from "./util.js";

export class Color {
    constructor(public r: number = 0, public g: number = 0, public b: number = 0, public a: number = 1) { }

    static lerp(start: Color, end: Color, t: number) {
        return new Color(lerp(start.r, end.r, t), lerp(start.g, end.g, t), lerp(start.b, end.b, t), lerp(start.a, end.a, t));
    }

    toColorString(context: CanvasRenderingContext2D): string | CanvasGradient {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}