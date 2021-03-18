import { Script } from "../script/script.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Transform } from "./transform.js";
import { Type } from "../util/util.js";
import { Camera } from "./camera.js";
import { Vec2 } from "../util/vector.js";
import { Collision } from "../physics/rigidbody.js";

export class GameObject {
    public name: string = "";
    public tag: string = "";
    private _transform: Transform = new Transform(this);
    private components: Script[] = [];
    public get transform(): Transform { return this._transform; }
    private isStarted: boolean = false;

    addComponent<T extends Script>(component: Type<T>): T {
        let comp = new component(this);
        this.components.push(comp);
        if (this.isStarted) comp.start();
        return comp as T;
    }

    getComponent<T extends Script>(component: Type<T>): T | null {
        for (const comp of this.components) {
            if (comp instanceof component) {
                return comp;
            }
        }

        return null;
    }

    getComponents<T extends Script>(component: Type<T>): T[] {
        let comps: T[] = [];
        for (const comp of this.components) {
            if (comp instanceof component) {
                comps.push(comp);
            }
        }
        return comps;
    }

    getAllComponents() { return this.components; }

    hasComponent<T extends Script>(component: Type<T>): boolean {
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
        if (this.isStarted) return;
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

    _draw(context: CanvasRenderingContext2D, cam: Camera) {
        for (const comp of this.components) {
            comp.draw(context, cam);
        }

        for (const child of this._transform.children) {
            child.gameObject._draw(context, cam);
        }
    }

    instantiate<T extends GameObject>(
        obj: Type<T>,
        position?: Vec2 | null,
        scale?: Vec2 | null,
        rotation?: number | null,
        parent?: Transform | null,
        worldSpace?: boolean | null
    ) {
        return SceneManager.activeScene.instantiate(obj, position, scale, rotation, parent, worldSpace);
    }

    destroy<T extends GameObject>(obj: T) {
        return SceneManager.activeScene.destroy(obj);
    }
}