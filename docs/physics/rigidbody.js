import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Time } from "../util/time.js";
import { Vec2 } from "../util/vector.js";
import { BoxCollider } from "./boxCollider.js";
export class RigidBody extends Script {
    constructor() {
        super(...arguments);
        this.velocity = Vec2.zero();
    }
    findCollisions(transforms) {
        for (const obj of transforms) {
            this.findCollisions(obj.children);
            let root = this.gameObject.transform.root;
            if (!obj.gameObject.hasComponent(BoxCollider) || obj.root === this.gameObject.transform.root)
                continue;
            let collider = this.gameObject.getComponent(BoxCollider);
            let otherCollider = obj.gameObject.getComponent(BoxCollider);
            let mtv = this.overlaps(collider, otherCollider);
            if (!mtv)
                continue;
            if (!collider.isTrigger)
                root.position = root.position.add(mtv);
            for (const [key, comps] of this.gameObject.getAllComponents()) {
                for (const comp of comps) {
                    if (collider.isTrigger) {
                        comp.onTriggerEnter(new Collision(collider, mtv));
                    }
                    else {
                        comp.onCollisionEnter(new Collision(collider, mtv));
                    }
                }
            }
        }
    }
    fixedUpdate() {
        this.gameObject.transform.position = this.gameObject.transform.position.add(this.velocity.mul_s(Time.fixedDeltaTime));
        for (const obj of SceneManager.activeScene.gameObjects) {
            this.findCollisions([obj.transform]);
        }
    }
    projectBodyRect(collider, axis) {
        let min = Infinity;
        let max = -Infinity;
        for (let j = 0; j < collider.verticies.length; j++) {
            let t = collider.gameObject.transform.objectToWorld.mul_vec2(collider.verticies[j]).dot(axis);
            if (t === -Infinity)
                console.log(t);
            if (t < min) {
                min = t;
            }
            else if (t > max) {
                max = t;
            }
        }
        return [min, max];
    }
    // private projectBodyCicle(collider: CircleCollider, axis: Vec2) {
    //     let t = collider.position.dot(axis);       
    //     return [t - collider.position.scale.x, t + collider.position.scale.x];
    // }
    /** Returns true if other overlaps one dimension of this. */
    overlaps(collider, other) {
        let smallestOverlap = Infinity;
        let MTVAxis = Vec2.zero();
        let colliderMat = collider.gameObject.transform.objectToWorld;
        let otherMat = other.gameObject.transform.objectToWorld;
        for (let i = 0; i < collider.verticies.length; i++) {
            let axis = colliderMat.mul_vec2(collider.verticies[i]).sub(colliderMat.mul_vec2(collider.verticies[i + 1 === collider.verticies.length ? 0 : i + 1])).normalize().prep();
            let overlap = this.lineOverlap(...this.projectBodyRect(collider, axis), ...this.projectBodyRect(other, axis));
            if (overlap === 0)
                return null;
            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                MTVAxis = axis;
            }
        }
        for (let i = 0; i < other.verticies.length; i++) {
            let axis = otherMat.mul_vec2(other.verticies[i]).sub(otherMat.mul_vec2(other.verticies[i + 1 === other.verticies.length ? 0 : i + 1])).normalize().prep();
            let overlap = this.lineOverlap(...this.projectBodyRect(collider, axis), ...this.projectBodyRect(other, axis));
            if (overlap === 0)
                return null;
            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                MTVAxis = axis;
            }
        }
        if (MTVAxis.dot(otherMat.mul_vec2(other.verticies[0]).sub(colliderMat.mul_vec2(collider.verticies[0]))) >= 0) {
            MTVAxis = MTVAxis.mul_s(-1);
        }
        return MTVAxis.mul_s(smallestOverlap);
    }
    lineOverlap(p1min, p1max, p2min, p2max) {
        return Math.max(0, Math.min(p1max, p2max) - Math.max(p1min, p2min));
    }
}
export class Collision {
    constructor(collider, mvt) {
        this.mvt = mvt;
    }
}
