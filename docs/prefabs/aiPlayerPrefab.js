import { GameObject } from "../core/gameObject.js";
import { CircleCollider } from "../physics/circleCollider.js";
import { RigidBody } from "../physics/rigidbody.js";
import { CircleRenderer } from "../renderer/circleRenderer.js";
import { AIPlayer } from "../script/aiPlayer.js";
import { Health } from "../script/health.js";
import { Weapon } from "../script/weapon.js";
import { Vec2 } from "../util/vector.js";
import { WeaponPrefab } from "./weaponPrefab.js";
export class AIPlayerPrefab extends GameObject {
    constructor() {
        super();
        this.name = "AI Player";
        this.tag = "Player";
        this.addComponent(Health);
        let visual = this.instantiate(GameObject, null, new Vec2(2, 2), null, this.transform);
        visual.addComponent(CircleRenderer);
        visual.addComponent(CircleCollider);
        this.addComponent(RigidBody);
        let detectionTrigger = this.instantiate(GameObject, Vec2.zero(), new Vec2(20, 20), null, this.transform);
        let collider = detectionTrigger.addComponent(CircleCollider);
        collider.isTrigger = true;
        let player = this.addComponent(AIPlayer);
        let weapon = this.instantiate(WeaponPrefab, new Vec2(0.6, 0.9), null, -Math.PI / 12, this.transform);
        player.weapon = weapon.getComponent(Weapon);
    }
}
