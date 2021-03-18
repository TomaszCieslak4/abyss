import { GameObject } from "../core/gameObject.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Mat3 } from "../util/matrix.js";
import { clampAngle } from "../util/util.js";
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

    public get position(): Vec2 { return this.objectToWorld.get_translation(); }
    public set position(value: Vec2) {
        if (this.parent) {
            this.localPosition = this.parent.objectToWorld.inverse().mul_vec2(value);
            return;
        }
        this.localPosition = value;
    }

    public get scale(): Vec2 { return this.objectToWorld.get_scale(); }
    public set scale(value: Vec2) {
        if (this.parent) {
            this.localScale = value.div(this.parent.objectToWorld.get_scale());
            return;
        }
        this.localScale = value;
    }

    public get rotation(): number { return this.objectToWorld.get_rotation(); }
    public set rotation(value: number) {
        value = clampAngle(value);
        if (this.parent) {
            this.localRotation = clampAngle(value - this.parent.objectToWorld.get_rotation());
            return;
        }
        this.localRotation = value;
    }

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