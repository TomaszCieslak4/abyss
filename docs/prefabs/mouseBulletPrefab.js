import { GameObject } from "../core/gameObject.js";
import { RigidBody } from "../physics/rigidbody.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
import { MouseBullet } from "../script/mouseBullets.js";
import { Vec2 } from "../util/vector.js";
export class MouseBulletPrefab extends GameObject {
    constructor() {
        super();
        this.addComponent(RigidBody);
        this.addComponent(SpriteRenderer);
        this.addComponent(MouseBullet);
        this.transform.scale = new Vec2(2, 2);
        this.start();
    }
}
