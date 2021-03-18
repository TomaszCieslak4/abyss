import { GameObject } from "../core/gameObject.js";
import { BoxCollider } from "../physics/boxCollider.js";
import { CircleCollider } from "../physics/circleCollider.js";
import { RigidBody } from "../physics/rigidbody.js";
import { CircleRenderer } from "../renderer/circleRenderer.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
import { DisplayedHealth } from "../script/displayedHealth.js";
import { HumanPlayer } from "../script/humanPlayer.js";
import { Player } from "../script/player.js";
import { Weapon } from "../script/weapon.js";
import { Vec2 } from "../util/vector.js";
import { WeaponPrefab } from "./weaponPrefab.js";

export class HumanPlayerPrefab extends GameObject {
    constructor() {
        super();
        this.name = "Player";
        this.tag = "Player";

        let visual = this.instantiate(GameObject, null, new Vec2(2, 2), null, this.transform);
        visual.addComponent(CircleRenderer);
        visual.addComponent(CircleCollider);

        this.addComponent(DisplayedHealth);
        this.addComponent(RigidBody);

        let player = this.addComponent(HumanPlayer);
        let weapon = this.instantiate(WeaponPrefab, new Vec2(0.6, 0.9), null, -Math.PI / 12, this.transform);
        player.weapon = weapon.getComponent(Weapon);
    }
}