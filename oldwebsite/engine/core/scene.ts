import { GameObject } from "./gameObject.js";
import { Transform } from "./transform.js";
import { Script } from "./script.js";
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
        newObj.transform.localPosition = position ?? Vec2.zero();
        newObj.transform.localScale = scale ?? Vec2.one();
        newObj.transform.localRotation = rotation ?? 0;
        if (worldSpace && parent) newObj.transform.parent = parent;

        newObj.load();
        newObj._start();
        return newObj;
    }

    destroy<T extends GameObject>(obj: T) {
        for (let i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i] === obj) {
                this.gameObjects.splice(i, 1);
            }
        }
        obj._destroy();
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

    *findComponents<T extends Script>(component: Type<T>, includeDisabled: boolean = false): Generator<T> {
        for (const obj of this.gameObjects) {
            yield* obj.getComponentsInChildren(component, includeDisabled);
        }
    }
}