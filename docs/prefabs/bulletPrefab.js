import { GameObject } from "../core/gameObject.js";
import { CircleCollider } from "../physics/circleCollider.js";
import { RigidBody } from "../physics/rigidbody.js";
import { CircleRenderer } from "../renderer/circleRenderer.js";
import { Bullet } from "../script/bullet.js";
import { Color } from "../util/color.js";
import { Vec2 } from "../util/vector.js";
export class BulletPrefab extends GameObject {
    constructor() {
        super();
        this.addComponent(RigidBody);
        let renderer = this.addComponent(CircleRenderer);
        this.addComponent(Bullet);
        this.addComponent(CircleCollider);
        this.transform.scale = new Vec2(0.1, 0.1);
        renderer.color = new Color(255, 215, 0);
    }
}
