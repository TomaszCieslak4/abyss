import { Bullet } from "./bullet.js";
import { GameObject } from "./gameObject.js";
import { Input } from "./input.js";
import { SceneManager } from "./scene/sceneManager.js";
import { Vec2 } from "./util/vector.js";
import { Weapon } from "./weapon.js";

export class Player extends GameObject {
    size: Vec2 = new Vec2(50, 50);
    position: Vec2 = new Vec2(200, 200);
    velocity: Vec2 = new Vec2(200, 200);

    sprite: HTMLImageElement = new Image();
    weapon: Weapon = new Weapon(this);

    update(dt: number) {
        this.velocity.set_s(Input.getAxis("x") * -500, Input.getAxis("y") * -500);

        if (Input.getButton("fire")) {
            console.log("DOWN");
            this.weapon.shoot();
        }

        super.update(dt);
    }

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
}