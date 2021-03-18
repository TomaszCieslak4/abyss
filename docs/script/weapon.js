import { Script } from "./script.js";
import { Time } from "../util/time.js";
import { BulletPrefab } from "../prefabs/bulletPrefab.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Bullet } from "./bullet.js";
export class Weapon extends Script {
    constructor() {
        super(...arguments);
        this.reloadTime = 0.1;
        this.timeToReload = 0;
        this.range = 10;
        this.magazine = null;
        this.damage = 1;
    }
    update() {
        this.timeToReload += Time.deltaTime;
    }
    shoot() {
        if (this.timeToReload < this.reloadTime || !this.magazine || this.magazine.ammo === 0)
            return false;
        this.timeToReload = 0;
        this.magazine.ammo--;
        let bullet = this.gameObject.instantiate(BulletPrefab, this.spawnpoint.transform.position, null, this.spawnpoint.transform.rotation, null);
        bullet.getComponent(RigidBody).velocity = bullet.transform.forward.mul_s(50);
        bullet.getComponent(Bullet).maxDistance = this.range;
        bullet.getComponent(Bullet).damage = this.damage;
        return true;
    }
    getRange() {
        return this.range;
    }
}
