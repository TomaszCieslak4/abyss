import { Script } from "./script.js";
import { SceneManager } from "./sceneManager.js";
import { Transform } from "./transform.js";
import { constructorof } from "./util.js";

export class GameObject {
    transform: Transform = new Transform(this);
    private components: Map<string, Script[]> = new Map([[Transform.name, [this.transform]]]);
    parent?: GameObject;
    children: GameObject[] = [];

    addComponent<T extends Script>(component: constructorof<T>) {
        let comp = new component(this);
        let comps = this.components.get(component.name);

        if (!comps) {
            comps = []
            this.components.set(component.name, comps);
        }

        comps.push(comp);
        return comp as T;
    }

    getComponent<T extends Script>(component: constructorof<T>) {
        let comps = this.components.get(component.name);
        if (!comps || comps.length === 0) return null;
        return comps[0] as T;
    }

    getComponents<T extends Script>(component: constructorof<T>) {
        let comps = this.components.get(component.name);
        return comps ?? [] as T[];
    }

    hasComponent<T extends Script>(component: constructorof<T>) {
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

    instantiate<T extends GameObject>(obj: constructorof<T>) {
        return SceneManager.activeScene.instantiate(obj);
    }

    destroy<T extends GameObject>(obj: T) {
        return SceneManager.activeScene.destroy(obj);
    }
}