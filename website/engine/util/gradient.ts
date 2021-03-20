import { Color } from "./color.js";

export class Gradient extends Color {
    constructor(startColor: Color, public endColor: Color = new Color()) {
        super(startColor.r, startColor.g, startColor.b, startColor.a);
    }

    toColorString(context: CanvasRenderingContext2D): string | CanvasGradient {
        let grad = context.createLinearGradient(-0.5, 0, 0.5, 0);
        grad.addColorStop(0, super.toColorString(context) as string);
        grad.addColorStop(1, `rgba(${this.endColor.r},${this.endColor.g},${this.endColor.b},${this.endColor.a})`);
        return grad;
    }
}