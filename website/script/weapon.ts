import { Vec2 } from "../util/vector.js";
import { Script } from "./script.js";
import { Time } from "../util/time.js";
import { BulletPrefab } from "../prefabs/bulletPrefab.js";
import { Camera } from "../core/camera.js";
import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
import { GameObject } from "../core/gameObject.js";
import { Bullet } from "./bullet.js";
import { Magazine } from "./magazine.js";
import { MagazinePrefab } from "../prefabs/magazinePrefab.js";

export class Weapon extends Script {
    reloadTime: number = 0.1;
    timeToReload: number = 0;
    spawnpoint!: GameObject;
    range: number = 10;
    magazine: Magazine | null = null;
    damage: number = 1;

    update() {
        this.timeToReload += Time.deltaTime;
    }

    shoot(): boolean {
        if (this.timeToReload < this.reloadTime || !this.magazine || this.magazine.ammo === 0) return false;

        this.timeToReload = 0;
        this.magazine.ammo--;
        let bullet = this.gameObject.instantiate(BulletPrefab, this.spawnpoint.transform.position, null, this.spawnpoint.transform.rotation, null);
        bullet.getComponent(RigidBody)!.velocity = bullet.transform.forward.mul_s(50);
        bullet.getComponent(Bullet)!.maxDistance = this.range;
        bullet.getComponent(Bullet)!.damage = this.damage;
        return true;
    }

    getRange() {
        return this.range;
    }
}