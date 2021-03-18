import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Mat3 } from "../util/matrix.js";
import { clampAngle } from "../util/util.js";
import { Vec2 } from "../util/vector.js";
export class Transform extends Script {
    constructor() {
        super(...arguments);
        this._localPosition = Vec2.zero();
        this._localScale = Vec2.one();
        this._localRotation = 0;
        this._objectToWorld = Mat3.identity();
        this.dirty = true;
        this._parent = null;
        this._children = [];
    }
    get localPosition() { return this._localPosition; }
    set localPosition(value) {
        this._localPosition = value;
        this.dirty = true;
        for (const child of this.children)
            child.localPosition = child.localPosition;
    }
    get localScale() { return this._localScale; }
    set localScale(value) {
        this._localScale = value;
        this.dirty = true;
        for (const child of this.children)
            child.localScale = child.localScale;
    }
    get localRotation() { return this._localRotation; }
    set localRotation(value) {
        value = clampAngle(value);
        this._localRotation = value;
        this.dirty = true;
        for (const child of this.children)
            child.localRotation = child.localRotation;
    }
    get objectToWorld() {
        if (this.dirty) {
            this._objectToWorld = Mat3.create_transformation(this.localPosition, this.localScale, this.localRotation);
            if (this.parent) {
                this._objectToWorld = this.parent.objectToWorld.mul(this._objectToWorld);
            }
            this.dirty = false;
        }
        return this._objectToWorld;
    }
    get position() { return this.objectToWorld.get_translation(); }
    set position(value) {
        if (this.parent) {
            this.localPosition = this.parent.objectToWorld.inverse().mul_vec2(value);
            return;
        }
        this.localPosition = value;
    }
    get scale() { return this.objectToWorld.get_scale(); }
    set scale(value) {
        if (this.parent) {
            this.localScale = value.div(this.parent.objectToWorld.get_scale());
            return;
        }
        this.localScale = value;
    }
    get rotation() { return this.objectToWorld.get_rotation(); }
    set rotation(value) {
        value = clampAngle(value);
        if (this.parent) {
            this.localRotation = clampAngle(value - this.parent.objectToWorld.get_rotation());
            return;
        }
        this.localRotation = value;
    }
    get parent() { return this._parent; }
    set parent(value) {
        if (this._parent)
            this._parent.removeChild(this);
        if (value)
            value.addChild(this);
    }
    get children() { return this._children; }
    removeChild(transform) {
        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i] === transform) {
                let position = transform.position;
                let rotation = transform.rotation;
                let scale = transform.scale;
                this.children.splice(i, 1);
                transform._parent = null;
                SceneManager.activeScene.gameObjects.push(transform.gameObject);
                transform.position = position;
                transform.rotation = rotation;
                transform.scale = scale;
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
        let position = transform.position;
        let rotation = transform.rotation;
        let scale = transform.scale;
        this.children.push(transform);
        transform._parent = this;
        transform.position = position;
        transform.rotation = rotation;
        transform.scale = scale;
    }
}
