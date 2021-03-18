import { GameObject } from "../core/gameObject.js";
import { Transform } from "../core/transform.js";
import { Type } from "../util/util.js";
import { Vec2 } from "../util/vector.js";

export class Scene {
    gameObjects: GameObject[] = [];

    instantiate<T extends GameObject>(
        obj: Type<T>,
        position?: Vec2 | null, scale?: Vec2 | null,
        rotation?: number | null,
        parent?: Transform | null,
        worldSpace?: boolean | null
    ) {
        let newObj = new obj();
        this.gameObjects.push(newObj);
        if (!worldSpace && parent) newObj.transform.parent = parent;
        if (position) newObj.transform.localPosition = position;
        if (scale) newObj.transform.localScale = scale;
        if (rotation) newObj.transform.localRotation = rotation;
        if (worldSpace && parent) newObj.transform.parent = parent;

        newObj._start();
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
            this.gameObjects[i]._update();
        }
    }

    fixedUpdate() {
        for (let i = 0; i < this.gameObjects.length; i++) {
            this.gameObjects[i]._fixedUpdate();
        }
    }

    onLoad() { }
    onUnLoad() { }
}