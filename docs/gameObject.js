import { SceneManager } from "./scene/sceneManager.js";
import { Vec2 } from "./util/vector.js";
export class GameObject {
    constructor() {
        this.size = Vec2.zero();
        this.position = Vec2.zero();
        this.velocity = Vec2.zero();
        SceneManager.activeScene.gameObjects.push(this);
    }
    update(dt) {
        this.position.i_add(this.velocity.mul_s(dt));
    }
    draw(context, cam) {
    }
    onCollisionEnter(other) {
    }
}
