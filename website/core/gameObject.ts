import { Script } from "../script/script.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Transform } from "./transform.js";
import { Type } from "../util/util.js";
import { Camera } from "./camera.js";
import { Vec2 } from "../util/vector.js";

export class GameObject {
    private _transform: Transform = new Transform(this);
    private components: Map<string, Script[]> = new Map([[Transform.name, [this._transform]]]);
    public get transform(): Transform { return this._transform; }

    addComponent<T extends Script>(component: Type<T>) {
        let comp = new component(this);
        let comps = this.components.get(component.name);

        if (!comps) {
            comps = []
            this.components.set(component.name, comps);
        }

        comps.push(comp);
        return comp as T;
    }

    getComponent<T extends Script>(component: Type<T>) {
        let comps = this.components.get(component.name);
        if (!comps || comps.length === 0) return null;
        return comps[0] as T;
    }

    getComponents<T extends Script>(component: Type<T>) {
        let comps = this.components.get(component.name);
        return comps ?? [] as T[];
    }

    hasComponent<T extends Script>(component: Type<T>) {
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

    draw(context: CanvasRenderingContext2D, cam: Camera) {
        for (const [key, comps] of this.components) {
            for (const comp of comps) {
                comp.draw(context, cam);
            }
        }

        for (const child of this._transform.children) {
            child.gameObject.draw(context, cam);
        }
    }

    instantiate<T extends GameObject>(obj: Type<T>, position: Vec2 = Vec2.one()) {
        return SceneManager.activeScene.instantiate(obj, position);
    }

    destroy<T extends GameObject>(obj: T) {
        return SceneManager.activeScene.destroy(obj);
    }
}