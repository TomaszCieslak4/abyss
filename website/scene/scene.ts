import { GameObject } from "../core/gameObject.js";
import { Type } from "../util/util.js";
import { Vec2 } from "../util/vector.js";

export class Scene {
    gameObjects: GameObject[] = [];

    instantiate<T extends GameObject>(obj: Type<T>, position: Vec2 = Vec2.one()) {
        let newObj = new obj();
        newObj.transform.position = position;
        this.gameObjects.push(newObj);
        return newObj;
    }

    destroy<T extends GameObject>(obj: T) {
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