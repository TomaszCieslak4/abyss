import { SceneManager } from "./sceneManager.js";
export class Scene {
    constructor() {
        this.gameObjects = [];
    }
    instantiate(obj) {
        let newObj = new obj();
        this.gameObjects.push(newObj);
        return newObj;
    }
    destroy(obj) {
        for (let i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i] === obj) {
                this.gameObjects.splice(i, 1);
            }
        }
    }
    update() {
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].update();
        }
    }
    fixedUpdate() {
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].fixedUpdate();
        }
    }
    draw() {
        SceneManager.context.clearRect(0, 0, SceneManager.width, SceneManager.height);
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i].draw();
        }
    }
    start() {
        for (const obj of this.gameObjects) {
            obj.start();
        }
    }
}
