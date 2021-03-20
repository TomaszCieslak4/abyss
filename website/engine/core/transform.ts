import { GameObject } from "./gameObject.js";
import { SceneManager } from "./sceneManager.js";
import { Script } from "./script.js";
import { Mat3 } from "../util/matrix.js";
import { clamp, clampAngle } from "../util/util.js";
import { Vec2 } from "../util/vector.js";

export class Transform extends Script {
    private _localPosition: Vec2 = Vec2.zero();
    public get localPosition(): Vec2 { return this._localPosition; }
    public set localPosition(value: Vec2) {
        this._localPosition = value;
        this.dirty = true;
        for (const child of this.children) child.localPosition = child.localPosition;
    }

    private _localScale: Vec2 = Vec2.one();
    public get localScale(): Vec2 { return this._localScale; }
    public set localScale(value: Vec2) {
        this._localScale = value;
        this.dirty = true;
        for (const child of this.children) child.localScale = child.localScale;
    }

    private _localRotation: number = 0;
    public get localRotation(): number { return this._localRotation; }
    public set localRotation(value: number) {
        value = clampAngle(value);
        this._localRotation = value;
        this.dirty = true;
        for (const child of this.children) child.localRotation = child.localRotation;
    }

    private _objectToWorld: Mat3 = Mat3.identity();
    private dirty: boolean = true;

    public get objectToWorld(): Mat3 {
        if (this.dirty) {
            this._objectToWorld = Mat3.create_transformation(this.localPosition, this.localScale, this.localRotation);
            if (this.parent) { this._objectToWorld = this.parent.objectToWorld.mul(this._objectToWorld); }
            this.dirty = false;
        }
        return this._objectToWorld;
    }

    public get position(): Vec2 { return this.parent ? this.objectToWorld.get_translation() : this.localPosition; }
    public set position(value: Vec2) {
        if (this.parent) {
            this.localPosition = this.parent.objectToWorld.inverse().mul_vec2(value);
            return;
        }
        this.localPosition = value;
    }

    public get scale(): Vec2 { return this.parent ? this.objectToWorld.get_scale() : this.localScale; }
    public set scale(value: Vec2) {
        if (this.parent) {
            this.localScale = value.div(this.parent.objectToWorld.get_scale());
            return;
        }
        this.localScale = value;
    }

    public get rotation(): number { return this.parent ? this.objectToWorld.get_rotation() : this.localRotation; }
    public set rotation(value: number) {
        value = clampAngle(value);
        if (this.parent) {
            this.localRotation = clampAngle(value - this.parent.objectToWorld.get_rotation());
            return;
        }
        this.localRotation = value;
    }

    public get root(): Transform { return this.parent == null ? this : this.parent.root; }
    public get forward(): Vec2 { return Vec2.from_angle(this.objectToWorld.get_rotation()); }
    public set forward(value: Vec2) { this.rotation = value.get_angle(); }
    private _parent: Transform | null = null;
    public get parent(): Transform | null { return this._parent; }
    public set parent(value: Transform | null) {
        if (this._parent) this._parent.removeChild(this);
        if (value) value.addChild(this);
    }

    private _children: Transform[] = [];
    public get children(): Transform[] { return this._children; }

    removeChild(transform: Transform) {
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

    setSiblingIndex(index: number) {
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

    getSiblingIndex(index: number) {
        if (this.parent) {
            for (let i = 0; i < this.parent.children.length; i++) {
                if (this.parent.children[i] === this) {
                    return i
                }
            }

            return -1;
        }

        for (let i = 0; i < SceneManager.activeScene.gameObjects.length; i++) {
            if (SceneManager.activeScene.gameObjects[i].transform === this) {
                return i
            }
        }

        return -1;
    }

    addChild(transform: Transform, index: number = -1) {
        if (transform._parent) {
            transform._parent.removeChild(this);
        } else {
            for (let i = 0; i < SceneManager.activeScene.gameObjects.length; i++) {
                if (SceneManager.activeScene.gameObjects[i] === transform.gameObject) {
                    SceneManager.activeScene.gameObjects.splice(i, 1);
                }
            }
        }

        let position = transform.position;
        let rotation = transform.rotation;
        let scale = transform.scale;

        if (index > this._children.length) index = this._children.length;
        if (index < 0) index = this._children.length;

        this._children.splice(index, 0, transform);
        transform._parent = this;

        transform.position = position;
        transform.rotation = rotation;
        transform.scale = scale;
    }
}