import { GameObject } from "../engine/core/gameObject.js";
import { Color } from "../engine/util/color.js";
import { Vec2 } from "../engine/util/vector.js";
import { GroundDrop } from "../scripts/groundDrop.js";
import { RigidBody } from "../engine/physics/rigidbody.js";
import { CircleRenderer } from "../engine/renderer/circleRenderer.js";
import { CircleCollider } from "../engine/physics/circleCollider.js";

export class GroundDropPrefab extends GameObject {
    load() {
        this.addComponent(RigidBody);
        let drop = this.addComponent(GroundDrop);
        drop.ring3 = this.instantiate(GameObject, null, new Vec2(2.7, 2.7), null, this.transform);
        let ring3Renderer = drop.ring3.addComponent(CircleRenderer);
        let collider = drop.ring3.addComponent(CircleCollider);
        collider.isTrigger = true;
        ring3Renderer.color = new Color(57, 55, 62);
        drop.ring2 = this.instantiate(GameObject, null, new Vec2(2, 2), null, this.transform);
        let ring2Renderer = drop.ring2.addComponent(CircleRenderer);
        ring2Renderer.color = new Color(91, 89, 95);
        drop.ring1 = this.instantiate(GameObject, null, new Vec2(1.5, 1.5), null, this.transform);
        let ring1Renderer = drop.ring1.addComponent(CircleRenderer);
        ring1Renderer.color = new Color(119, 117, 122);
    }
}