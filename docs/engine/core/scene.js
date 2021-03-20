import { Vec2 } from "../util/vector.js";
export class Scene {
    constructor() {
        this.gameObjects = [];
    }
    instantiate(obj, position, scale, rotation, parent, worldSpace) {
        let newObj = new obj();
        this.gameObjects.push(newObj);
        if (!worldSpace && parent)
            newObj.transform.parent = parent;
        newObj.transform.localPosition = position !== null && position !== void 0 ? position : Vec2.zero();
        newObj.transform.localScale = scale !== null && scale !== void 0 ? scale : Vec2.one();
        newObj.transform.localRotation = rotation !== null && rotation !== void 0 ? rotation : 0;
        if (worldSpace && parent)
            newObj.transform.parent = parent;
        newObj.load();
        newObj._start();
        return newObj;
    }
    destroy(obj) {
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
    *findComponents(component, includeDisabled = false) {
        for (const obj of this.gameObjects) {
            yield* obj.getComponentsInChildren(component, includeDisabled);
        }
    }
}
