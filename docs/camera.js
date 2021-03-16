import { SceneManager } from "./scene/sceneManager.js";
import { Vec2 } from "./util/vector.js";
export class Camera {
    constructor() {
        this.size = Vec2.zero();
        this.position = Vec2.zero();
        this.canvas = document.getElementById('stage');
        this.context = this.canvas.getContext('2d');
    }
    draw() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.size.set_s(this.canvas.width, this.canvas.height);
        this.context.clearRect(0, 0, this.size.x, this.size.y);
        for (const obj of SceneManager.activeScene.gameObjects) {
            obj.draw(this.context, this);
        }
    }
    toViewport(x) {
        return x.sub(this.position);
    }
    toWorld(x) {
        return x.add(this.position);
    }
}
Camera.main = new Camera();
