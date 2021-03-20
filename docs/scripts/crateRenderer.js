import { Color } from "../engine/util/color.js";
import { HealthRenderer } from "./healthRenderer.js";
export class CrateRenderer extends HealthRenderer {
    draw(context, cam) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform());
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
    setHealth(percent) {
        this.color = Color.lerp(new Color(250, 83, 41), new Color(35, 142, 249), percent);
    }
}
