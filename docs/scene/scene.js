import { Vec2 } from "../util/vector.js";
export class Scene {
    constructor() {
        this.gameObjects = [];
    }
    instantiate(obj, position = Vec2.one()) {
        let newObj = new obj();
        newObj.transform.position = position;
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
    onLoad() { }
    onUnLoad() { }
}
