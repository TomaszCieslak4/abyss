import { Camera } from "../core/camera.js";
import { Renderer } from "./renderer.js";

export class TriangleRenderer extends Renderer {
    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform() as any);
        context.fillStyle = this.color.toColorString(context);
        context.beginPath();
        context.moveTo(0, -0.5);
        context.lineTo(0.5, 0.5);
        context.lineTo(-0.5, 0.5);
        context.fill();
        context.restore();
    }
}