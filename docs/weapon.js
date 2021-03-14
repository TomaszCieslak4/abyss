import { Color } from "./engine/color.js";
import { GameObject } from "./engine/gameObject.js";
import { SceneManager } from "./engine/sceneManager.js";
import { Vec2 } from "./engine/vector.js";
export class Weapon extends GameObject {
    constructor() {
        super();
        this.color = new Color(0, 255, 0);
        this.transform.position = new Vec2(200, 200);
        this.transform.scale = new Vec2(100, 100);
        this.transform.start();
    }
    draw() {
        super.draw();
        SceneManager.context.fillStyle = this.color.toColorString();
        SceneManager.context.fillRect(this.transform.position.x - this.transform.scale.x / 2, this.transform.position.y - this.transform.scale.y / 2, this.transform.scale.x, this.transform.scale.y);
    }
}
