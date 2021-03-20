import { SceneManager } from "./sceneManager.js";
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
    getComponent(component, includeDisabled = false) {
        for (const comp of this.components) {
            if ((includeDisabled || comp.enabled) && comp instanceof component) {
                return comp;
            }
        }
        return null;
    }
    destroyComponent(component) {
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i] === component) {
                this.components[i].onDestroy();
                this.components.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    destroyComponents(components) {
        for (let i = this.components.length - 1; i >= 0; i--) {
            for (let j = 0; j < components.length; j++) {
                if (this.components[i] === components[j]) {
                    this.components[i].onDestroy();
                    this.components.splice(i, 1);
                }
            }
        }
    }
    destroyComponentsOfType(component) {
        for (let i = this.components.length - 1; i >= 0; i--) {
            if (this.components[i] instanceof component) {
                this.components[i].onDestroy();
                this.components.splice(i, 1);
            }
        }
    }
    *getComponents(component, includeDisabled = false) {
        for (const comp of this.components) {
            if ((includeDisabled || comp.enabled) && comp instanceof component) {
                yield comp;
            }
        }
    }
    *getComponentsInChildrenHelper(transforms, component, includeDisabled = false) {
        for (const obj of transforms) {
            for (const comp of obj.gameObject.components) {
                if ((includeDisabled || comp.enabled) && comp instanceof component) {
                    yield comp;
                }
            }
            yield* this.getComponentsInChildrenHelper(obj.children, component);
        }
    }
    *getComponentsInChildren(component, includeDisabled = false) {
        yield* this.getComponentsInChildrenHelper([this.transform], component, includeDisabled);
    }
    _update() {
        for (const comp of this.components) {
            if (comp.enabled)
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
            if (comp.enabled)
                comp.fixedUpdate();
        }
        for (const child of this._transform.children) {
            child.gameObject._fixedUpdate();
        }
    }
    instantiate(obj, position, scale, rotation, parent, worldSpace) {
        return SceneManager.activeScene.instantiate(obj, position, scale, rotation, parent, worldSpace);
    }
    destroy(obj) {
        return SceneManager.activeScene.destroy(obj);
    }
    _destroy() {
        for (const comp of this.components) {
            comp.onDestroy();
        }
        for (const child of this._transform.children) {
            child.gameObject._destroy();
        }
    }
    load() {
    }
}
