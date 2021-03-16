import { Camera } from "./camera.js";
import { SceneManager } from "./scene/sceneManager.js";
import { Vec2 } from "./util/vector.js";

export class GameObject {
    size: Vec2 = Vec2.zero();
    position: Vec2 = Vec2.zero();
    velocity: Vec2 = Vec2.zero();

    constructor() {
        SceneManager.activeScene.gameObjects.push(this);
    }

    update(dt: number) {
        this.position.i_add(this.velocity.mul_s(dt));
    }

    draw(context: CanvasRenderingContext2D, cam: Camera) {

    }

    onCollisionEnter(other: GameObject) {

    }
}