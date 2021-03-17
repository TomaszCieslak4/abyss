import { Color } from "../util/color.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Camera } from "../core/camera.js";

export class SpriteRenderer extends Script {
    sprite?: HTMLImageElement;

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        let pos = cam.toViewport(this.gameObject.transform.position);
        context.translate(pos.x, pos.y);

        if (!this.sprite || !this.sprite.complete || this.sprite.naturalWidth === 0) {
            context.fillStyle = "magenta";
            context.fillRect(
                -this.gameObject.transform.scale.x,
                -this.gameObject.transform.scale.y,
                this.gameObject.transform.scale.x * 2,
                this.gameObject.transform.scale.y * 2
            );
            context.restore();
            return;
        }

        context.drawImage(this.sprite,
            -this.gameObject.transform.scale.x,
            -this.gameObject.transform.scale.y,
            this.gameObject.transform.scale.x * 2,
            this.gameObject.transform.scale.y * 2
        );
        context.restore();
    }
}