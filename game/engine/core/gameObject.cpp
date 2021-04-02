// import { Script } from "./script.js";
// import { SceneManager } from "./sceneManager.js";
// import { Transform } from "./transform.js";
// import { Type } from "../util/util.js";
// import { Camera } from "./camera.js";
// import { Vec2 } from "../util/vector.js";
#include <iostream>

class GameObject
{
  public:
    std::string name = "";
    std::string tag = "";

    // Transform transform(): Transform { return this._transform; }
    // addComponent<T extends Script>(component: Type<T>): T {
    //     let comp = new component(this);
    //     this.components.push(comp);
    //     if (this.isStarted) comp.start();
    //     return comp as T;
    // }

    // getComponent<T extends Script>(component: Type<T>, includeDisabled: boolean = false): T | null {
    //     for (const comp of this.components) {
    //         if ((includeDisabled || comp.enabled) && comp instanceof component) {
    //             return comp;
    //         }
    //     }

    //     return null;
    // }

    // destroyComponent<T extends Script>(component: T): boolean {
    //     for (let i = 0; i < this.components.length; i++) {
    //         if (this.components[i] === component) {
    //             this.components[i].onDestroy();
    //             this.components.splice(i, 1);
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    // destroyComponents<T extends Script>(components: T[]) {
    //     for (let i = this.components.length - 1; i >= 0; i--) {
    //         for (let j = 0; j < components.length; j++) {
    //             if (this.components[i] === components[j]) {
    //                 this.components[i].onDestroy();
    //                 this.components.splice(i, 1);
    //             }
    //         }
    //     }
    // }

    // destroyComponentsOfType<T extends Script>(component: Type<T>) {
    //     for (let i = this.components.length - 1; i >= 0; i--) {
    //         if (this.components[i] instanceof component) {
    //             this.components[i].onDestroy();
    //             this.components.splice(i, 1);
    //         }
    //     }
    // }

    // *getComponents<T extends Script>(component: Type<T>, includeDisabled: boolean = false): Generator<T> {
    //     for (const comp of this.components) {
    //         if ((includeDisabled || comp.enabled) && comp instanceof component) {
    //             yield comp;
    //         }
    //     }
    // }

    // private *getComponentsInChildrenHelper<T extends Script>(transforms: Transform[], component: Type<T>, includeDisabled: boolean = false): Generator<T> {
    //     for (const obj of transforms) {
    //         for (const comp of obj.gameObject.components) {
    //             if ((includeDisabled || comp.enabled) && comp instanceof component) {
    //                 yield comp;
    //             }
    //         }

    //         yield* this.getComponentsInChildrenHelper(obj.children, component);
    //     }
    // }

    // *getComponentsInChildren<T extends Script>(component: Type<T>, includeDisabled: boolean = false): Generator<T> {
    //     yield* this.getComponentsInChildrenHelper([this.transform], component, includeDisabled);
    // }

    // _update() {
    //     for (const comp of this.components) {
    //         if (comp.enabled) comp.update();
    //     }

    //     for (const child of this._transform.children) {
    //         child.gameObject._update();
    //     }
    // }

    // _start() {
    //     if (this.isStarted) return;
    //     this.isStarted = true;
    //     for (const comp of this.components) {
    //         comp.start();
    //     }
    // }

    // _fixedUpdate() {
    //     for (const comp of this.components) {
    //         if (comp.enabled) comp.fixedUpdate();
    //     }

    //     for (const child of this._transform.children) {
    //         child.gameObject._fixedUpdate();
    //     }
    // }

    // instantiate<T extends GameObject>(
    //     obj: Type<T>,
    //     position?: Vec2 | null,
    //     scale?: Vec2 | null,
    //     rotation?: number | null,
    //     parent?: Transform | null,
    //     worldSpace?: boolean | null
    // ) {
    //     return SceneManager.activeScene.instantiate(obj, position, scale, rotation, parent, worldSpace);
    // }

    // destroy<T extends GameObject>(obj: T) {
    //     return SceneManager.activeScene.destroy(obj);
    // }

    // _destroy() {
    //     for (const comp of this.components) {
    //         comp.onDestroy();
    //     }

    //     for (const child of this._transform.children) {
    //         child.gameObject._destroy();
    //     }
    // }

    // load() {

    // }

    // private:
    //     _transform: Transform = new Transform(this);
    //     components: Script[] = [];
    //     isStarted: boolean = false;
};