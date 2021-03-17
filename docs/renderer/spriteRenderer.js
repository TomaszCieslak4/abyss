import { Script } from "../script/script.js";
export class SpriteRenderer extends Script {
    draw(context, cam) {
        context.save();
        let pos = cam.toViewport(this.gameObject.transform.position);
        context.translate(pos.x, pos.y);
        if (!this.sprite || !this.sprite.complete || this.sprite.naturalWidth === 0) {
            context.fillStyle = "magenta";
            context.fillRect(-this.gameObject.transform.scale.x, -this.gameObject.transform.scale.y, this.gameObject.transform.scale.x * 2, this.gameObject.transform.scale.y * 2);
            context.restore();
            return;
        }
        context.drawImage(this.sprite, -this.gameObject.transform.scale.x, -this.gameObject.transform.scale.y, this.gameObject.transform.scale.x * 2, this.gameObject.transform.scale.y * 2);
        context.restore();
    }
}
