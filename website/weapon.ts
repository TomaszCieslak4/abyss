import { Bullet } from "./bullet.js";
import { Camera } from "./camera.js";
import { GameObject } from "./gameObject.js";
import { Input } from "./input.js";
import { MouseBullet } from "./mouseBullets.js";
import { Player } from "./player.js";
import { SceneManager } from "./scene/sceneManager.js";
import { Vec2 } from "./util/vector.js";

export class Weapon extends GameObject {
    size: Vec2 = new Vec2(20, 20);
    sprite: HTMLImageElement = new Image();
    reloadTime: number = 0.1;
    timeToReload: number = 0;

    constructor(public player: Player) { super(); }

    update(dt: number) {
        this.position.set(this.player.position);
        this.timeToReload += dt;
    }

    shoot() {
        if (this.timeToReload >= this.reloadTime) {
            this.timeToReload = 0;

            let bullet = new Bullet();
            bullet.velocity = this.position.sub(Camera.main.toWorld(Input.mousePos)).normalize().i_mul_s(-800);
            bullet.position.set(this.position.add(bullet.size.div_s(2)).sub(this.size.div_s(2)));
        }
    }
}