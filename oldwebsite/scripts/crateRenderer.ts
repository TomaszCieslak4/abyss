import { Color } from "../engine/util/color.js";
import { Camera } from "../engine/core/camera.js";
import { lerp } from "../engine/util/util.js";
import { HealthRenderer } from "./healthRenderer.js";

export class CrateRenderer extends HealthRenderer {

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform() as any);
        context.fillStyle = this.color.toColorString(context);
        context.fillRect(-0.5, -0.5, 1, 1);

        context.lineWidth = 0.075;
        context.strokeStyle = new Color(249, 249, 249).toColorString(context);
        context.beginPath();
        context.lineCap = "round";
        context.moveTo(-0.5 + 0.025, -0.5 + 0.025);
        context.lineTo(0.5 - 0.025, -0.5 + 0.025);
        context.lineTo(0.5 - 0.025, 0.5 - 0.025);
        context.lineTo(-0.5 + 0.025, 0.5 - 0.025);
        context.lineTo(-0.5 + 0.025, -0.5 + 0.025);
        context.moveTo(-0.5 + 0.025, -0.5 + 0.025);
        context.lineTo(0.5 - 0.025, 0.5 - 0.025);
        context.moveTo(0.5 - 0.025, -0.5 + 0.025);
        context.lineTo(-0.5 + 0.025, 0.5 - 0.025);
        context.stroke();
        context.restore();
    }

    setHealth(percent: number) {
        this.color = Color.lerp(new Color(250, 83, 41), new Color(35, 142, 249), percent);
    }
}