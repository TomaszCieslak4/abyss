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
        this.name = "Player";

        this.addComponent(RigidBody);
        this.addComponent(SpriteRenderer);
        let player = this.addComponent(Player);

        let weapon = this.instantiate(WeaponPrefab);
        weapon.transform.parent = this.transform;
        weapon.transform.localScale = new Vec2(0.1, 2);
        weapon.transform.localPosition = new Vec2(1, 0);
        player.weapon = weapon.getComponent(Weapon);

        this.start();
    }
}