export class Scene {
    constructor() {
        this.gameObjects = [];
    }
    instantiate(obj, position, scale, rotation, parent, worldSpace) {
        let newObj = new obj();
        this.gameObjects.push(newObj);
        if (!worldSpace && parent)
            newObj.transform.parent = parent;
        if (position)
            newObj.transform.localPosition = position;
        if (scale)
            newObj.transform.localScale = scale;
        if (rotation)
            newObj.transform.localRotation = rotation;
        if (worldSpace && parent)
            newObj.transform.parent = parent;
        newObj._start();
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
