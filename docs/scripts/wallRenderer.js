import { Color } from "../engine/util/color.js";
import { Renderer } from "../engine/renderer/renderer.js";
export class WallRenderer extends Renderer {
    constructor() {
        super(...arguments);
        this.wall = 0;
        this.playRadius = 1;
        this.color = new Color(204, 41, 54);
    }
    draw(context, cam) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform());
        context.fillStyle = this.color.toColorString(context);
        context.fillRect(-0.5, -0.5, 1, 1);
        context.fillStyle = "#100E17";
        if (this.wall === 0) {
            for (let i = 0; i < this.playRadius + 1; i++) {
                let offset = -0.5 + (i + 0.5) / (this.playRadius + 1);
                context.beginPath();
                context.moveTo(-0.5 / this.playRadius - offset, -0.5);
                context.lineTo(-0.001 / this.playRadius - offset, 0.5);
                context.lineTo(0.5 / this.playRadius - offset, 0.5);
                context.lineTo(0.001 / this.playRadius - offset, -0.5);
                context.fill();
            }
        }
        else if (this.wall === 1) {
            for (let i = 0; i < this.playRadius + 1; i++) {
                let offset = -0.5 + (i + 0.5) / (this.playRadius + 1);
                context.beginPath();
                context.moveTo(-0.5 / this.playRadius - offset, -0.5);
                context.lineTo(-0.001 / this.playRadius - offset, 0.5);
                context.lineTo(0.5 / this.playRadius - offset, 0.5);
                context.lineTo(0.001 / this.playRadius - offset, -0.5);
                context.fill();
            }
        }
        else if (this.wall === 2) {
            for (let i = 0; i < this.playRadius + 1; i++) {
                let offset = -0.5 + (i + 1) / (this.playRadius + 1);
                context.beginPath();
                context.moveTo(-0.5, -0.5 / this.playRadius - offset);
                context.lineTo(0.5, -0.001 / this.playRadius - offset);
                context.lineTo(0.5, 0.5 / this.playRadius - offset);
                context.lineTo(-0.5, 0.001 / this.playRadius - offset);
                context.fill();
            }
        }
        else if (this.wall === 3) {
            for (let i = 0; i < this.playRadius + 1; i++) {
                let offset = -0.5 + i / (this.playRadius + 1);
                context.beginPath();
                context.moveTo(-0.5, -0.5 / this.playRadius - offset);
                context.lineTo(0.5, -0.001 / this.playRadius - offset);
                context.lineTo(0.5, 0.5 / this.playRadius - offset);
                context.lineTo(-0.5, 0.001 / this.playRadius - offset);
                context.fill();
            }
        }
        // context.lineWidth = 0.2;
        // context.moveTo(0, 0.3);
        // context.lineTo(0, 0.4);
        // context.stroke();
        context.restore();
    }
}
