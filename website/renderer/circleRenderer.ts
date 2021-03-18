import { Color } from "../util/color.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Camera } from "../core/camera.js";

export class CircleRenderer extends Script {
    color: Color = new Color(0, 0, 255);
    startAngle: number = 0;
    endAngle: number = Math.PI * 2;

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform() as any);

        context.fillStyle = this.color.toColorString();
        context.beginPath();
        context.arc(0, 0, 0.5, this.startAngle, this.endAngle);
        context.fill();
        context.restore();
    }
}