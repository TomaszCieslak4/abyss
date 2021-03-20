import { Color } from "../engine/util/color.js";
import { lerp } from "../engine/util/util.js";
import { Renderer } from "../engine/renderer/renderer.js";
export class HealthRenderer extends Renderer {
    constructor() {
        super(...arguments);
        this.startAngle = Math.PI / 2 * 1.05;
        this.endAngle = 3 * Math.PI / 2 * 0.95;
    }
    draw(context, cam) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform());
        context.scale(1.2, 1.2);
        context.lineWidth = 0.04;
        context.beginPath();
        context.strokeStyle = new Color(255, 131, 49).toColorString(context);
        context.arc(0, 0, 0.5, Math.PI / 2 * 1.05, 3 * Math.PI / 2 * 0.95);
        context.stroke();
        context.beginPath();
        context.strokeStyle = new Color(49, 255, 125).toColorString(context);
        context.arc(0, 0, 0.5, this.startAngle, this.endAngle);
        context.stroke();
        context.restore();
    }
    setHealth(percent) {
        let amount = lerp(3 * Math.PI / 2 * 0.95 - Math.PI / 2 * 1.05, 0, percent);
        this.startAngle = Math.PI / 2 * 1.05 + amount;
    }
}
