import { SceneManager } from "../scene/sceneManager.js";
import { Transform } from "./transform.js";
export class GameObject {
    constructor() {
        this.name = "";
        this.tag = "";
        this._transform = new Transform(this);
        this.components = new Map([[Transform.name, [this._transform]]]);
        this.isStarted = false;
    }
    get transform() { return this._transform; }
    addComponent(component) {
        let comp = new component(this);
        let comps = this.components.get(component.name);
        if (!comps) {
            comps = [];
            this.components.set(component.name, comps);
        }
        comps.push(comp);
        if (this.isStarted)
            comp.start();
        return comp;
    }
    getComponent(component) {
        let comps = this.components.get(component.name);
        if (!comps || comps.length === 0)
            return null;
        return comps[0];
    }
    getComponents(component) {
        let comps = this.components.get(component.name);
        return comps !== null && comps !== void 0 ? comps : [];
    }
    getAllComponents() { return this.components; }
    hasComponent(component) {
        let comp = this.components.get(component.name);
        return comp ? comp.length > 0 : false;
    }
    _update() {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.update();
            }
        }
        for (const child of this._transform.children) {
            child.gameObject._update();
        }
    }
    _start() {
        if (this.isStarted)
            return;
        this.isStarted = true;
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.start();
            }
        }
    }
    _fixedUpdate() {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.fixedUpdate();
            }
        }
        for (const child of this._transform.children) {
            child.gameObject._fixedUpdate();
        }
    }
    _draw(context, cam) {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.draw(context, cam);
            }
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
