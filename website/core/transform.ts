import { GameObject } from "../core/gameObject.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Vec2 } from "../util/vector.js";

export class Transform extends Script {
    private _position: Vec2 = Vec2.zero();
    public get position(): Vec2 {
        return this._position;
    }
    public set position(value: Vec2) {
        let dif = value.sub(this._position);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].position = this.children[i].position.add(dif);
        }
        this._position.set(value);
    }
    public scale: Vec2 = Vec2.zero();
    private _parent: Transform | null = null;
    public get parent(): Transform | null {
        return this._parent;
    }
    public set parent(value: Transform | null) {
        if (this._parent) this._parent.removeChild(this);
        if (value) value.addChild(this);
    }
    private _children: Transform[] = [];
    public get children(): Transform[] {
        return this._children;
    }

    removeChild(transform: Transform) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === transform) {
                this.children.splice(i, 1);
                transform._parent = null;
                SceneManager.activeScene.gameObjects.push(transform.gameObject);
                break;
            }
        }
    }

    addChild(transform: Transform) {
        if (transform._parent) {
            transform._parent.removeChild(this);
        } else {
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