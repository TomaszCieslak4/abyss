import { SceneManager } from "./sceneManager.js";
import { Script } from "./script.js";
import { Mat3 } from "../util/matrix.js";
import { clamp, clampAngle } from "../util/util.js";
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
    get position() { return this.parent ? this.objectToWorld.get_translation() : this.localPosition; }
    set position(value) {
        if (this.parent) {
            this.localPosition = this.parent.objectToWorld.inverse().mul_vec2(value);
            return;
        }
        this.localPosition = value;
    }
    get scale() { return this.parent ? this.objectToWorld.get_scale() : this.localScale; }
    set scale(value) {
        if (this.parent) {
            this.localScale = value.div(this.parent.objectToWorld.get_scale());
            return;
        }
        this.localScale = value;
    }
    get rotation() { return this.parent ? this.objectToWorld.get_rotation() : this.localRotation; }
    set rotation(value) {
        value = clampAngle(value);
        if (this.parent) {
            this.localRotation = clampAngle(value - this.parent.objectToWorld.get_rotation());
            return;
        }
        this.localRotation = value;
    }
    get root() { return this.parent == null ? this : this.parent.root; }
    get forward() { return Vec2.from_angle(this.objectToWorld.get_rotation()); }
    set forward(value) { this.rotation = value.get_angle(); }
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
    setSiblingIndex(index) {
        if (this.parent) {
            for (let i = 0; i < this.parent.children.length; i++) {
                if (this.parent.children[i] === this) {
                    this.parent.children.splice(i, 1);
                }
            }
            index = clamp(index, 0, this.parent.children.length);
            this.parent.children.splice(index, 0, this);
            return;
        }
        for (let i = 0; i < SceneManager.activeScene.gameObjects.length; i++) {
            if (SceneManager.activeScene.gameObjects[i].transform === this) {
                SceneManager.activeScene.gameObjects.splice(i, 1);
            }
        }
        index = clamp(index, 0, SceneManager.activeScene.gameObjects.length);
        SceneManager.activeScene.gameObjects.splice(index, 0, this.gameObject);
    }
    getSiblingIndex(index) {
        if (this.parent) {
            for (let i = 0; i < this.parent.children.length; i++) {
                if (this.parent.children[i] === this) {
                    return i;
                }
            }
            return -1;
        }
        for (let i = 0; i < SceneManager.activeScene.gameObjects.length; i++) {
            if (SceneManager.activeScene.gameObjects[i].transform === this) {
                return i;
            }
        }
        return -1;
    }
    addChild(transform, index = -1) {
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
        if (index > this._children.length)
            index = this._children.length;
        if (index < 0)
            index = this._children.length;
        this._children.splice(index, 0, transform);
        transform._parent = this;
        transform.position = position;
        transform.rotation = rotation;
        transform.scale = scale;
    }
}
