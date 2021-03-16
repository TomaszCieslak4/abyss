import { Bullet } from "./bullet.js";
import { Camera } from "./camera.js";
import { GameObject } from "./gameObject.js";
import { Input } from "./input.js";
import { SceneManager } from "./scene/sceneManager.js";
import { Vec2 } from "./util/vector.js";
import { Weapon } from "./weapon.js";

export class Wall extends GameObject {
    constructor(
        public position: Vec2 = new Vec2(200, 200),
        public size: Vec2 = new Vec2(50, 50)
    ) { super(); }

    sprite: HTMLImageElement = new Image();

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
}