import { Scene } from "./scene.js";
import { Type } from "./util.js";

export class SceneManager {
    private static scenes: Type<Scene>[] = []
    private static canvas: HTMLCanvasElement;
    static activeScene: Scene;
    static width: number;
    static height: number;
    static context: CanvasRenderingContext2D;

    static setCanvas(canvas: HTMLCanvasElement) {
        SceneManager.canvas = canvas;
        SceneManager.width = canvas.width;
        SceneManager.height = canvas.height;
        SceneManager.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    }

    static init(scenes: Type<Scene>[]) {
        SceneManager.scenes = scenes;
    }

    static setScene(ind: number) {
        this.activeScene = new SceneManager.scenes[ind]();
    }
}