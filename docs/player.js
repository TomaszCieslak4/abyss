import { Color } from "./engine/color.js";
import { GameObject } from "./engine/gameObject.js";
import { Input } from "./engine/input.js";
import { RigidBody } from "./engine/rigidbody.js";
import { SpriteRenderer } from "./engine/spriteRenderer.js";
export class Player extends GameObject {
    constructor() {
        super();
        this.color = new Color(0, 255, 0);
        this.speed = 200;
        this.rigidBody = this.addComponent(RigidBody);
        let renderer = this.addComponent(SpriteRenderer);
        renderer.sprite = new Image();
        renderer.sprite.src = "test.png";
    }
    update() {
        super.update();
        this.rigidBody.velocity.set_s(Input.getAxis("x") * -this.speed, Input.getAxis("y") * -this.speed);
    }
}
