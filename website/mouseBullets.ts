import { Camera } from "./camera.js";
import { GameObject } from "./gameObject.js";
import { Input } from "./input.js";
import { Vec2 } from "./util/vector.js";

export class MouseBullet extends GameObject {
    size: Vec2 = new Vec2(20, 20);
    sprite: HTMLImageElement = new Image();

    update(dt: number) {
        this.velocity = Vec2.lerp(this.velocity, this.position.sub(Camera.main.toWorld(Input.mousePos)).normalize().i_mul_s(-800), 0.2);
        super.update(dt);
    }

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        context.save();
        let pos = cam.toViewport(this.position);
        context.translate(pos.x, pos.y);

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