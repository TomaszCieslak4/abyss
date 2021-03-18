import { SceneManager } from "../scene/sceneManager.js";
import { Transform } from "./transform.js";
export class GameObject {
    constructor() {
        this.name = "";
        this.tag = "";
        this._transform = new Transform(this);
        this.components = [];
        this.isStarted = false;
    }
    get transform() { return this._transform; }
    addComponent(component) {
        let comp = new component(this);
        this.components.push(comp);
        if (this.isStarted)
            comp.start();
        return comp;
    }
    getComponent(component) {
        for (const comp of this.components) {
            if (comp instanceof component) {
                return comp;
            }
        }
        return null;
    }
    getComponents(component) {
        let comps = [];
        for (const comp of this.components) {
            if (comp instanceof component) {
                comps.push(comp);
            }
        }
        return comps;
    }
    getAllComponents() { return this.components; }
    hasComponent(component) {
        for (const comp of this.components) {
            if (comp instanceof component) {
                return true;
            }
        }
        return false;
    }
    _update() {
        for (const comp of this.components) {
            comp.update();
        }
        for (const child of this._transform.children) {
            child.gameObject._update();
        }
    }
    _start() {
        if (this.isStarted)
            return;
        this.isStarted = true;
        for (const comp of this.components) {
            comp.start();
        }
    }
    _fixedUpdate() {
        for (const comp of this.components) {
            comp.fixedUpdate();
        }
        for (const child of this._transform.children) {
            child.gameObject._fixedUpdate();
        }
    }
    _draw(context, cam) {
        for (const comp of this.components) {
            comp.draw(context, cam);
        }
        for (const child of this._transform.children) {
            child.gameObject._draw(context, cam);
        }
    }
    instantiate(obj, position, scale, rotation, parent, worldSpace) {
        return SceneManager.activeScene.instantiate(obj, position, scale, rotation, parent, worldSpace);
    }
    destroy(obj) {
        return SceneManager.activeScene.destroy(obj);
    }
}
