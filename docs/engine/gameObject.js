import { SceneManager } from "./sceneManager.js";
import { Transform } from "./transform.js";
export class GameObject {
    constructor() {
        this.transform = new Transform(this);
        this.components = new Map([[Transform.name, [this.transform]]]);
        this.children = [];
    }
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
    }
    start() {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.start();
            }
        }
    }
    fixedUpdate() {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.fixedUpdate();
            }
        }
    }
    draw() {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.draw();
            }
        }
    }
    instantiate(obj) {
        return SceneManager.activeScene.instantiate(obj);
    }
    destroy(obj) {
        return SceneManager.activeScene.destroy(obj);
    }
}
