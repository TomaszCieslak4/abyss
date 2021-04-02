import { GameObject } from "../engine/core/gameObject.js";
import { CircleCollider } from "../engine/physics/circleCollider.js";
import { RigidBody } from "../engine/physics/rigidbody.js";
import { CircleRenderer } from "../engine/renderer/circleRenderer.js";
import { Bullet } from "../scripts/bullet.js";
import { Color } from "../engine/util/color.js";
import { Vec2 } from "../engine/util/vector.js";

export class BulletPrefab extends GameObject {
    load() {
        this.transform.scale = new Vec2(0.1, 0.1);
        this.addComponent(RigidBody);
        this.addComponent(Bullet);

        let collider = this.addComponent(CircleCollider);
        collider.isTrigger = true;

        let renderer = this.addComponent(CircleRenderer);
        renderer.color = new Color(255, 215, 0);
    }
}