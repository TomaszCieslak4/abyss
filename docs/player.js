import { GameObject } from "./gameObject.js";
import { Input } from "./input.js";
import { Vec2 } from "./util/vector.js";
import { Weapon } from "./weapon.js";
export class Player extends GameObject {
    constructor() {
        super(...arguments);
        this.size = new Vec2(50, 50);
        this.position = new Vec2(200, 200);
        this.velocity = new Vec2(200, 200);
        this.sprite = new Image();
        this.weapon = new Weapon(this);
    }
    update(dt) {
        this.velocity.set_s(Input.getAxis("x") * -500, Input.getAxis("y") * -500);
        if (Input.getButton("fire")) {
            console.log("DOWN");
            this.weapon.shoot();
        }
        super.update(dt);
    }
    draw(context) {
        context.save();
        context.translate(this.position.x, this.position.y);
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
