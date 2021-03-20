import { Renderer } from "./renderer.js";
export class TriangleRenderer extends Renderer {
    draw(context, cam) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform());
        context.fillStyle = this.color.toColorString(context);
        context.beginPath();
        context.moveTo(0, -0.5);
        context.lineTo(0.5, 0.5);
        context.lineTo(-0.5, 0.5);
        context.fill();
        context.restore();
    }
}
