import { Bullet } from "./bullet.js";
import { GameObject } from "./gameObject.js";
import { Input } from "./input.js";
import { Vec2 } from "./util/vector.js";
export class Weapon extends GameObject {
    constructor(player) {
        super();
        this.player = player;
        this.size = new Vec2(20, 20);
        this.sprite = new Image();
        this.reloadTime = 0.1;
        this.timeToReload = 0;
    }
    update(dt) {
        this.position.set(this.player.position);
        this.timeToReload += dt;
    }
    shoot() {
        if (this.timeToReload >= this.reloadTime) {
            this.timeToReload = 0;
            let bullet = new Bullet();
            bullet.velocity = this.position.sub(Input.mousePos).normalize().i_mul_s(-800);
            bullet.position.set(this.position.add(bullet.size.div_s(2)).sub(this.size.div_s(2)));
        }
    }
}
