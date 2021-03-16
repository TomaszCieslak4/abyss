import { GameObject } from "./gameObject.js";
import { Vec2 } from "./util/vector.js";

export class Bullet extends GameObject {
    size: Vec2 = new Vec2(20, 20);
    sprite: HTMLImageElement = new Image();

    draw(context: CanvasRenderingContext2D) {
        context.save();
        context.translate(this.position.x, this.position.y);

        if (!this.sprite.complete || this.sprite.naturalWidth === 0) {
            context.fillStyle = "magenta";

            context.fillRect(
                -this.size.x,
                -this.size.y,
                this.size.x,
                this.size.y
            );
            context.restore();
            return;
        }

        context.drawImage(
            this.sprite,
            -this.size.x,
            -this.size.y,
            this.size.x,
            this.size.y,
        );
        context.restore();
    }

    onCollisionEnter(other: GameObject) {

    }
}