import { Renderer } from "./renderer.js";
export class RectRenderer extends Renderer {
    draw(context, cam) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform());
        context.fillStyle = this.color.toColorString(context);
        context.fillRect(-0.5, -0.5, 1, 1);
        context.restore();
    }
}
