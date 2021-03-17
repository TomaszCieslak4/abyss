import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Vec2 } from "../util/vector.js";
export class Transform extends Script {
    constructor() {
        super(...arguments);
        this._position = Vec2.zero();
        this.scale = Vec2.zero();
        this._parent = null;
        this._children = [];
    }
    get position() {
        return this._position;
    }
    set position(value) {
        let dif = value.sub(this._position);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].position = this.children[i].position.add(dif);
        }
        this._position.set(value);
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        if (this._parent)
            this._parent.removeChild(this);
        if (value)
            value.addChild(this);
    }
    get children() {
        return this._children;
    }
    removeChild(transform) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === transform) {
                this.children.splice(i, 1);
                transform._parent = null;
                SceneManager.activeScene.gameObjects.push(transform.gameObject);
                break;
            }
        }
    }
    addChild(transform) {
        if (transform._parent) {
            transform._parent.removeChild(this);
        }
        else {
            for (let i = 0; i < SceneManager.activeScene.gameObjects.length; i++) {
                if (SceneManager.activeScene.gameObjects[i] === transform.gameObject) {
                    SceneManager.activeScene.gameObjects.splice(i, 1);
                }
            }
        }
        this.children.push(transform);
        transform._parent = this;
        console.log(this, SceneManager.activeScene.gameObjects);
    }
}
