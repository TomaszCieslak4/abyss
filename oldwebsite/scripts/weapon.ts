import { Vec2 } from "../engine/util/vector.js";
import { Time } from "../engine/util/time.js";
import { BulletPrefab } from "../prefabs/bulletPrefab.js";
import { RigidBody } from "../engine/physics/rigidbody.js";
import { GameObject } from "../engine/core/gameObject.js";
import { Bullet } from "./bullet.js";
import { HumanPlayer } from "./humanPlayer.js";
import { Player } from "./player.js";
import { Interactable } from "./interactable.js";

export class Weapon extends Interactable {
    reloadTime: number = 0.1;
    timeToReload: number = 0;
    spawnpoint!: GameObject;
    range: number = 10;
    damage: number = 10;
    private _ammo: number = 50;
    public get ammo(): number { return this._ammo; }
    public set ammo(value: number) {
        this._ammo = value;
        this.gameObject.transform.parent?.gameObject.getComponent(HumanPlayer)?.ammoCountChanged();
    }
    capacity: number = 50;
    owner: Player | null = null;

    update() {
        this.timeToReload += Time.deltaTime;
    }

    shoot(): boolean {
        if (this.timeToReload < this.reloadTime || this.ammo === 0 || !this.owner) return false;

        this.timeToReload = 0;
        this.ammo--;
        let bullet = this.gameObject.instantiate(BulletPrefab, this.spawnpoint.transform.position, null, this.spawnpoint.transform.rotation, null);
        bullet.getComponent(RigidBody)!.velocity = bullet.transform.forward.mul_s(50);
        let bulletScript = bullet.getComponent(Bullet)!;
        bulletScript.maxDistance = this.range;
        bulletScript.damage = this.damage;
        bulletScript.owner = this.owner;
        return true;
    }

    getRange() {
        return this.range;
    }

    interact(player: Player) {
        return player.equipWeapon(this);
    }
}