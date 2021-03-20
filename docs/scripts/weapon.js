import { Time } from "../engine/util/time.js";
import { BulletPrefab } from "../prefabs/bulletPrefab.js";
import { RigidBody } from "../engine/physics/rigidbody.js";
import { Bullet } from "./bullet.js";
import { HumanPlayer } from "./humanPlayer.js";
import { Interactable } from "./interactable.js";
export class Weapon extends Interactable {
    constructor() {
        super(...arguments);
        this.reloadTime = 0.1;
        this.timeToReload = 0;
        this.range = 10;
        this.damage = 10;
        this._ammo = 50;
        this.capacity = 50;
        this.owner = null;
    }
    get ammo() { return this._ammo; }
    set ammo(value) {
        var _a, _b;
        this._ammo = value;
        (_b = (_a = this.gameObject.transform.parent) === null || _a === void 0 ? void 0 : _a.gameObject.getComponent(HumanPlayer)) === null || _b === void 0 ? void 0 : _b.ammoCountChanged();
    }
    update() {
        this.timeToReload += Time.deltaTime;
    }
    shoot() {
        if (this.timeToReload < this.reloadTime || this.ammo === 0 || !this.owner)
            return false;
        this.timeToReload = 0;
        this.ammo--;
        let bullet = this.gameObject.instantiate(BulletPrefab, this.spawnpoint.transform.position, null, this.spawnpoint.transform.rotation, null);
        bullet.getComponent(RigidBody).velocity = bullet.transform.forward.mul_s(50);
        let bulletScript = bullet.getComponent(Bullet);
        bulletScript.maxDistance = this.range;
        bulletScript.damage = this.damage;
        bulletScript.owner = this.owner;
        return true;
    }
    getRange() {
        return this.range;
    }
    interact(player) {
        return player.equipWeapon(this);
    }
}
