import { GameObject } from "../core/gameObject.js";
import { BoxCollider } from "../physics/boxCollider.js";
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
        this.tag = "Player";

        this.addComponent(RigidBody);
        this.addComponent(SpriteRenderer);
        this.addComponent(BoxCollider);

        let player = this.addComponent(Player);
        let weapon = this.instantiate(WeaponPrefab, new Vec2(0.55, 0), null, null, this.transform);

        player.weapon = weapon.getComponent(Weapon);
    }
}