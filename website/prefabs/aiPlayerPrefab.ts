import { GameObject } from "../engine/core/gameObject.js";
import { CircleCollider } from "../engine/physics/circleCollider.js";
import { CircleRenderer } from "../engine/renderer/circleRenderer.js";
import { AIPlayer } from "../scripts/aiPlayer.js";
import { Weapon } from "../scripts/weapon.js";
import { Color } from "../engine/util/color.js";
import { Vec2 } from "../engine/util/vector.js";
import { ARPrefab } from "./weapons/arPrefab.js";
import { PlayerPrefab } from "./playerPrefab.js";
import { Health } from "../scripts/health.js";

export class AIPlayerPrefab extends PlayerPrefab {
    load() {
        let detectionTrigger = this.instantiate(GameObject, Vec2.zero(), new Vec2(20, 20), null, this.transform);
        let collider = detectionTrigger.addComponent(CircleCollider);
        collider.isTrigger = true;
        // let rangeIndicator = detectionTrigger.addComponent(CircleRenderer);
        // rangeIndicator.color = new Color(255, 0, 0, 0.2);

        this.addComponent(AIPlayer);

        super.load();
        let health = this.getComponent(Health)!;
        health.deathScore = 50;
    }
}