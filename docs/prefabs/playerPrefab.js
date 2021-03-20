import { GameObject } from "../engine/core/gameObject.js";
import { CircleCollider } from "../engine/physics/circleCollider.js";
import { RigidBody } from "../engine/physics/rigidbody.js";
import { CircleRenderer } from "../engine/renderer/circleRenderer.js";
;
import { Color } from "../engine/util/color.js";
import { Gradient } from "../engine/util/gradient.js";
import { Vec2 } from "../engine/util/vector.js";
import { HealthRenderer } from "../scripts/healthRenderer.js";
import { Health } from "../scripts/health.js";
const PLAYER_COLORS = [
    new Gradient(new Color(249, 156, 35), new Color(249, 212, 35)),
    new Gradient(new Color(249, 156, 35), new Color(249, 212, 35)),
];
export class PlayerPrefab extends GameObject {
    load() {
        this.name = "Player";
        this.tag = "Player";
        this.addComponent(RigidBody);
        let visual = this.instantiate(GameObject, null, new Vec2(2, 2), null, this.transform);
        let renderer = visual.addComponent(CircleRenderer);
        visual.addComponent(CircleCollider);
        this.addComponent(Health).healthObj = visual.addComponent(HealthRenderer);
        renderer.color = PLAYER_COLORS[Math.floor(Math.random() * (PLAYER_COLORS.length - 1))];
    }
}
