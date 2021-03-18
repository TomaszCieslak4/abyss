import { Color } from "../util/color.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Camera } from "../core/camera.js";

export class SpriteRenderer extends Script {
    sprite?: HTMLImageElement;

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform() as any);

        if (!this.sprite || !this.sprite.complete || this.sprite.naturalWidth === 0) {
            context.fillStyle = "red";
            context.fillRect(-0.5, -0.5, 1, 1);
            context.restore();
            return;
        }

        context.drawImage(this.sprite, -0.5, -0.5, 1, 1);
        context.restore();
    }
}