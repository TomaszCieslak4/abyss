import { SceneManager } from "../scene/sceneManager.js";
import { Transform } from "./transform.js";
import { Vec2 } from "../util/vector.js";
export class GameObject {
    constructor() {
        this.name = "";
        this._transform = new Transform(this);
        this.components = new Map([[Transform.name, [this._transform]]]);
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
    hasComponent(component) {
        let comp = this.components.get(component.name);
        return comp ? comp.length > 0 : false;
    }
    update() {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.update();
            }
        }
        for (const child of this._transform.children) {
            child.gameObject.update();
        }
    }
    start() {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.start();
            }
        }
        for (const child of this._transform.children) {
            child.gameObject.start();
        }
    }
    fixedUpdate() {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.fixedUpdate();
            }
        }
        for (const child of this._transform.children) {
            child.gameObject.fixedUpdate();
        }
    }
    draw(context, cam) {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.draw(context, cam);
            }
        }
        for (const child of this._transform.children) {
            child.gameObject.draw(context, cam);
        }
    }
    instantiate(obj, position = Vec2.zero()) {
        return SceneManager.activeScene.instantiate(obj, position);
    }
    destroy(obj) {
        return SceneManager.activeScene.destroy(obj);
    }
}
