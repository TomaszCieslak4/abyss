import { Camera } from "../core/camera.js";
import { Renderer } from "./renderer.js";

export class CircleRenderer extends Renderer {
    startAngle: number = 0;
    endAngle: number = Math.PI * 2;

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform() as any);

        context.fillStyle = this.color.toColorString(context);
        context.beginPath();
        context.arc(0, 0, 0.5, this.startAngle, this.endAngle);
        context.fill();
        context.restore();
    }
}