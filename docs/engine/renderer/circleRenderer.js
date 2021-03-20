import { Renderer } from "./renderer.js";
export class CircleRenderer extends Renderer {
    constructor() {
        super(...arguments);
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
    }
    draw(context, cam) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform());
        context.fillStyle = this.color.toColorString(context);
        context.beginPath();
        context.arc(0, 0, 0.5, this.startAngle, this.endAngle);
        context.fill();
        context.restore();
    }
}
