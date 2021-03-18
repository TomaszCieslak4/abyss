import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Mat3 } from "../util/matrix.js";
import { Vec2 } from "../util/vector.js";

export class Camera extends Script {
    public static main: Camera;

    private canvas!: HTMLCanvasElement;
    private context!: CanvasRenderingContext2D;

    start() {
        this.canvas = document.getElementById('stage') as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        Camera.main = this;
    }

    beginDraw() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (const obj of SceneManager.activeScene.gameObjects) {
            obj.draw(this.context, this);
        }
    }

    viewportToWorld() {
        let size = Math.min(this.canvas.width, this.canvas.height);
        return this.gameObject.transform.objectToWorld.mul(new Mat3([1, 0, 0, 0, -1, 0, 0, 0, 1])).mul(Mat3.create_scale(new Vec2(1 / size, 1 / size)).mul(Mat3.create_translation(new Vec2(-this.canvas.width / 2, -this.canvas.height / 2))));
        // 
        // return this.gameObject.transform.objectToWorld
        //     .mul(Mat3.create_translation(new Vec2(-this.canvas.width / 2, -this.canvas.height / 2)))
        //     .mul(Mat3.create_scale(new Vec2(1 / size, 1 / size)));
        // .mul(new Mat3([1, 0, 0, 0, -1, 0, 0, 0, 1]));
    }

    worldToViewport() {
        let size = Math.min(this.canvas.width, this.canvas.height);

        return this.gameObject.transform.objectToWorld
            .mul(Mat3.create_scale(new Vec2(1 / size, 1 / size)))
            .mul(Mat3.create_translation(new Vec2(-this.canvas.width / 2, -this.canvas.height / 2)))
            .inverse().mul(new Mat3([1, 0, 0, 0, -1, 0, 0, 0, 1]));
    }
}