import { Vec2 } from "../util/vector.js";
import { Script } from "./script.js";
import { Time } from "../util/time.js";
import { MouseBulletPrefab } from "../prefabs/mouseBulletPrefab.js";
import { Camera } from "../core/camera.js";
import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";

export class Weapon extends Script {
    size: Vec2 = new Vec2(20, 20);
    sprite: HTMLImageElement = new Image();
    reloadTime: number = 0.1;
    timeToReload: number = 0;

    update() {
        this.timeToReload += Time.deltaTime;
    }

    shoot() {
        if (this.timeToReload >= this.reloadTime) {
            this.timeToReload = 0;

            let bullet = this.gameObject.instantiate(MouseBulletPrefab);
            let direction = this.gameObject.transform.position.sub(Camera.main.toWorld(Input.mousePos)).normalize();
            bullet.getComponent(RigidBody)!.velocity = direction.mul_s(-800);
            bullet.transform.position.set(this.gameObject.transform.position);
        }
    }
}