import { Color } from "../util/color.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Camera } from "../core/camera.js";
import { lerp } from "../util/util.js";

export class HealthRenderer extends Script {
    color: Color = new Color(0, 255, 0);
    startAngle: number = Math.PI / 2 * 1.05;
    endAngle: number = 3 * Math.PI / 2 * 0.95;

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform() as any);

        context.scale(2.4, 2.4);
        context.beginPath();

        context.beginPath();
        context.fillStyle = new Color(255, 0, 0).toColorString();
        context.arc(0, 0, 0.5, Math.PI / 2 * 1.05, 3 * Math.PI / 2 * 0.95);
        context.fill();

        context.beginPath();
        context.fillStyle = this.color.toColorString();
        context.arc(0, 0, 0.5, this.startAngle, this.endAngle);
        context.fill();

        context.beginPath();
        context.scale(0.95, 0.95);
        context.fillStyle = new Color(0, 0, 0, 1).toColorString();
        context.arc(0, 0, 0.5, Math.PI / 2 * 1.05, 3 * Math.PI / 2 * 0.95);
        context.fill();
        context.restore();
    }

    setHealth(health: number, maxHealth: number) {
        let amount = lerp(3 * Math.PI / 2 * 0.95 - Math.PI / 2 * 1.05, 0, health / maxHealth) * 1;
        this.endAngle = 3 * Math.PI / 2 * 0.95 - amount / 2;
        this.startAngle = Math.PI / 2 * 1.05 + amount / 2;
    }
}