import { GameObject } from "../core/gameObject.js";
import { BoxCollider } from "../physics/boxCollider.js";
import { RigidBody } from "../physics/rigidbody.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
import { Bullet } from "../script/bullet.js";
import { Vec2 } from "../util/vector.js";
export class MouseBulletPrefab extends GameObject {
    constructor() {
        super();
        this.addComponent(RigidBody);
        this.addComponent(SpriteRenderer);
        this.addComponent(Bullet);
        this.addComponent(BoxCollider);
        this.transform.scale = new Vec2(0.1, 0.1);
    }
}
