import { SceneManager } from "./scene/sceneManager.js";
import { Vec2 } from "./util/vector.js";

export class Camera {
    public static main: Camera = new Camera();

    private canvas!: HTMLCanvasElement;
    private context!: CanvasRenderingContext2D;

    size: Vec2 = Vec2.zero();
    position: Vec2 = Vec2.zero();

    constructor() {
        this.canvas = document.getElementById('stage') as HTMLCanvasElement;
        this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    draw() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.size.set_s(this.canvas.width, this.canvas.height);
        this.context.clearRect(0, 0, this.size.x, this.size.y);

        for (const obj of SceneManager.activeScene.gameObjects) {
            obj.draw(this.context);
        }
    }
}