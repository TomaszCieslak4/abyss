import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Vec2 } from "../util/vector.js";
export class Camera extends Script {
    start() {
        this.canvas = document.getElementById('stage');
        this.context = this.canvas.getContext('2d');
        Camera.main = this;
    }
    beginDraw() {
        // this.canvas.width = window.innerWidth;
        // this.canvas.height = window.innerHeight;
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (const obj of SceneManager.activeScene.gameObjects) {
            obj.draw(this.context, this);
        }
    }
    toViewport(x) {
        return x.sub(this.gameObject.transform.position).add(new Vec2(this.canvas.width, this.canvas.height).div_s(2));
    }
    toWorld(x) {
        return x.add(this.gameObject.transform.position).sub(new Vec2(this.canvas.width, this.canvas.height).div_s(2));
    }
}
