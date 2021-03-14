import { Color } from "./engine/color.js";
import { GameObject } from "./engine/gameObject.js";
import { RigidBody } from "./engine/rigidbody.js";
import { SceneManager } from "./engine/sceneManager.js";
export class Bullet extends GameObject {
    constructor() {
        super();
        this.color = new Color(255, 0, 0);
        this.addComponent(RigidBody);
    }
    draw() {
        super.draw();
        SceneManager.context.fillStyle = this.color.toColorString();
        SceneManager.context.fillRect(this.transform.position.x - this.transform.scale.x, this.transform.position.y - this.transform.scale.y, this.transform.scale.x, this.transform.scale.y);
    }
}
