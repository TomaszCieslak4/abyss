import { GameObject } from "./gameObject.js";
import { Vec2 } from "./util/vector.js";
export class Wall extends GameObject {
    constructor(position = new Vec2(200, 200), size = new Vec2(50, 50)) {
        super();
        this.position = position;
        this.size = size;
        this.sprite = new Image();
    }
    draw(context, cam) {
        context.save();
        let pos = cam.toViewport(this.position);
        context.translate(pos.x, pos.y);
        if (!this.sprite.complete || this.sprite.naturalWidth === 0) {
            context.fillStyle = "magenta";
            context.fillRect(-this.size.x, -this.size.y, this.size.x, this.size.y);
            context.restore();
            return;
        }
        context.drawImage(this.sprite, -this.size.x, -this.size.y, this.size.x, this.size.y);
        context.restore();
    }
}
