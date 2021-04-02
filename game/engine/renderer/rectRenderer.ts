import { Camera } from "../core/camera.js";
import { Renderer } from "./renderer.js";

export class RectRenderer extends Renderer {

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform() as any);
        context.fillStyle = this.color.toColorString(context);
        context.fillRect(-0.5, -0.5, 1, 1);
        context.restore();
    }
}