import { GameObject } from "../core/gameObject.js";
import { RigidBody } from "../physics/rigidbody.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
import { Player } from "../script/player.js";
import { Weapon } from "../script/weapon.js";
import { Vec2 } from "../util/vector.js";
import { WeaponPrefab } from "./weaponPrefab.js";
export class PlayerPrefab extends GameObject {
    constructor() {
        super();
        this.addComponent(RigidBody);
        this.addComponent(SpriteRenderer);
        let player = this.addComponent(Player);
        let weapon = this.instantiate(WeaponPrefab);
        weapon.transform.position = new Vec2(100, 100);
        weapon.transform.parent = this.transform;
        player.weapon = weapon.getComponent(Weapon);
        this.transform.scale = new Vec2(20, 20);
        this.start();
    }
}
