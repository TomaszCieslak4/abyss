import { Script } from "../script/script.js";
export class SpriteRenderer extends Script {
    draw(context, cam) {
        context.save();
        context.setTransform(...cam.worldToViewport().mul(this.gameObject.transform.objectToWorld).toCanvasTransform());
        if (!this.sprite || !this.sprite.complete || this.sprite.naturalWidth === 0) {
            context.fillStyle = "red";
            context.fillRect(-1, -1, 2, 2);
            context.restore();
            return;
        }
        context.drawImage(this.sprite, -1, -1, 2, 2);
        context.restore();
    }
}
