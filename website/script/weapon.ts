import { Vec2 } from "../util/vector.js";
import { Script } from "./script.js";
import { Time } from "../util/time.js";
import { MouseBulletPrefab } from "../prefabs/mouseBulletPrefab.js";
import { Camera } from "../core/camera.js";
import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
import { GameObject } from "../core/gameObject.js";

export class Weapon extends Script {
    sprite: HTMLImageElement = new Image();
    reloadTime: number = 0.1;
    timeToReload: number = 0;
    spawnpoint!: GameObject;

    update() {
        this.timeToReload += Time.deltaTime;
    }

    shoot() {
        if (this.timeToReload >= this.reloadTime) {
            this.timeToReload = 0;

            let direction = Camera.main.viewportToWorld().mul_vec2(Input.mousePos).sub(this.spawnpoint.transform.position).normalize();
            let bullet = this.gameObject.instantiate(MouseBulletPrefab, this.spawnpoint.transform.position, null, direction.get_angle(), null);
            bullet.getComponent(RigidBody)!.velocity = bullet.transform.forward.mul_s(50);
        }
    }
}