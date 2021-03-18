import { Script } from "./script.js";
import { Time } from "../util/time.js";
import { MouseBulletPrefab } from "../prefabs/mouseBulletPrefab.js";
import { Camera } from "../core/camera.js";
import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
export class Weapon extends Script {
    constructor() {
        super(...arguments);
        this.sprite = new Image();
        this.reloadTime = 0.1;
        this.timeToReload = 0;
    }
    update() {
        this.timeToReload += Time.deltaTime;
    }
    shoot() {
        if (this.timeToReload >= this.reloadTime) {
            this.timeToReload = 0;
            let bullet = this.gameObject.instantiate(MouseBulletPrefab);
            let direction = this.gameObject.transform.position.sub(Camera.main.viewportToWorld().mul_vec2(Input.mousePos)).normalize();
            bullet.getComponent(RigidBody).velocity = direction.mul_s(-800);
            bullet.transform.position = this.gameObject.transform.position;
        }
    }
}
