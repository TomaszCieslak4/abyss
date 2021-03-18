import { Color } from "../util/color.js";
import { Script } from "../script/script.js";
export class CircleRenderer extends Script {
    constructor() {
        super(...arguments);
        this.color = new Color(0, 0, 255);
        this.startAngle = 0;
        this.endAngle = Math.PI * 2;
    }
    draw(context, cam) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform());
        context.fillStyle = this.color.toColorString();
        context.beginPath();
        context.arc(0, 0, 0.5, this.startAngle, this.endAngle);
        context.fill();
        context.restore();
    }
}
