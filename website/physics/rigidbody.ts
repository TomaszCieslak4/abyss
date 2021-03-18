import { GameObject } from "../core/gameObject.js";
import { Transform } from "../core/transform.js";
import { SceneManager } from "../scene/sceneManager.js";
import { Script } from "../script/script.js";
import { Time } from "../util/time.js";
import { Vec2 } from "../util/vector.js";
import { BoxCollider } from "./boxCollider.js";
import { CircleCollider } from "./circleCollider.js";
import { Collider } from "./collider.js";

export class RigidBody extends Script {
    velocity: Vec2 = Vec2.zero();

    private findCollisions(transforms: Transform[], collider: Collider, collisions: Collision[]) {
        for (const obj of transforms) {
            this.findCollisions(obj.children, collider, collisions);

            let mtv = null;
            let root = this.gameObject.transform.root;
            if (obj.root === root) continue;

            let colliders = obj.gameObject.getComponents(Collider);

            for (const otherCollider of colliders) {
                if (otherCollider.isTrigger) continue;
                // let otherCollider = obj.gameObject.getComponent(CircleCollider)!;
                if (collider instanceof CircleCollider) {
                    if (otherCollider instanceof CircleCollider) {
                        let diff = otherCollider.gameObject.transform.position.sub(collider.gameObject.transform.position);
                        let radius = (otherCollider.gameObject.transform.scale.x + collider.gameObject.transform.scale.x) / 2;
                        let mag = diff.sqr_magnitude();

                        if (mag < radius * radius) {
                            mtv = diff.normalize().mul_s(Math.sqrt(mag) - radius);
                        }
                    } else if (otherCollider instanceof BoxCollider) {
                        mtv = this.circleRectIntersects(collider, otherCollider);
                        // if (mvt) console.log(mvt);
                        //     console.log("COLLIDE", collider.gameObject.transform.root.gameObject, otherCollider.gameObject.transform.root.gameObject);
                    }
                }
                // let mtv = this.overlaps(collider, otherCollider);

                if (!mtv) continue;
                if (!collider.isTrigger) root.position = root.position.add(mtv);

                let collison = new Collision(collider, otherCollider, mtv);

                if (collider.collisions.find(item => item.other === otherCollider)) {
                    for (const comp of this.gameObject.getAllComponents()) {
                        if (collider.isTrigger) {
                            comp.onTriggerStay(collison);
                        } else {
                            comp.onCollisionStay(collison);
                        }
                    }
                } else {
                    for (const comp of this.gameObject.getAllComponents()) {
                        if (collider.isTrigger) {
                            comp.onTriggerEnter(collison);
                        } else {
                            comp.onCollisionEnter(collison);
                        }
                    }
                }
                collisions.push(collison);
            }
        }
    }

    findCollisionsInChildren(transforms: Transform[]) {
        for (const trans of transforms) {
            this.findCollisionsInChildren(trans.children);

            let colliders = trans.gameObject.getComponents(Collider);

            for (const collider of colliders) {
                let collisions: Collision[] = [];

                for (const obj of SceneManager.activeScene.gameObjects) {
                    this.findCollisions([obj.transform], collider, collisions);
                }

                for (const collision of collider.collisions) {
                    if (collisions.find(item => item.other === collision.other)) continue;

                    for (const comp of this.gameObject.getAllComponents()) {
                        if (collider.isTrigger) {
                            comp.onTriggerExit(collision.other);
                        } else {
                            comp.onCollisionExit(collision.other);
                        }
                    }
                }
                collider.collisions = collisions;
            }
        }
    }

    fixedUpdate() {
        this.gameObject.transform.position = this.gameObject.transform.position.add(this.velocity.mul_s(Time.fixedDeltaTime));
        this.findCollisionsInChildren([this.gameObject.transform]);
    }

    private projectBodyRect(collider: BoxCollider, axis: Vec2): [number, number] {
        let min = Infinity;
        let max = -Infinity;

        for (let j = 0; j < collider.verticies.length; j++) {
            let t = collider.gameObject.transform.objectToWorld.mul_vec2(collider.verticies[j]).dot(axis);
            if (t === -Infinity)
                console.log(t);

            if (t < min) {
                min = t;
            } else if (t > max) {
                max = t;
            }
        }

        return [min, max];
    }

    circleRectIntersects(circle: CircleCollider, rect: BoxCollider): Vec2 | null {


        // clamp(value, min, max) - limits value to the range min..max
        let circlePos = circle.gameObject.transform.position;
        let circleRadius = circle.gameObject.transform.scale.x / 2;
        let rectPos = rect.gameObject.transform.position;
        let rectScale = rect.gameObject.transform.scale.div_s(2);
        let closest = circlePos.clamp(rectPos.sub(rectScale), rectPos.add(rectScale));

        // Find the closest point to the circle within the rectangle
        // float closestX = clamp(circle.X, rectangle.Left, rectangle.Right);
        // float closestY = clamp(circle.Y, rectangle.Top, rectangle.Bottom);

        // Calculate the distance between the circle's center and this closest point
        // float distanceX = circle.X - closestX;
        // float distanceY = circle.Y - closestY;
        let diff = circlePos.sub(closest);
        let dist = diff.sqr_magnitude();

        // console.log(dist);
        // debugger;

        // If the distance is less than the circle's radius, an intersection occurs
        // float distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
        if (dist >= (circleRadius * circleRadius)) return null;
        // console.log(circlePos, rectPos, rectScale, closest, rectPos.sub(rectScale), rectPos.add(rectScale),
        //     circle.gameObject);
        // console.log(dist, circleRadius * circleRadius);
        // debugger
        return diff.normalize().mul_s(circleRadius - Math.sqrt(dist));
    }

    // private projectBodyCicle(collider: CircleCollider, axis: Vec2) {
    //     let t = collider.position.dot(axis);       

    //     return [t - collider.position.scale.x, t + collider.position.scale.x];
    // }

    /** Returns true if other overlaps one dimension of this. */
    private overlaps(collider: BoxCollider, other: BoxCollider) {
        let smallestOverlap = Infinity;
        let MTVAxis = Vec2.zero();

        let colliderMat = collider.gameObject.transform.objectToWorld;
        let otherMat = other.gameObject.transform.objectToWorld;
        for (let i = 0; i < collider.verticies.length; i++) {
            let axis = colliderMat.mul_vec2(collider.verticies[i]).sub(colliderMat.mul_vec2(collider.verticies[i + 1 === collider.verticies.length ? 0 : i + 1])).normalize().prep();
            let overlap = this.lineOverlap(...this.projectBodyRect(collider, axis), ...this.projectBodyRect(other, axis));

            if (overlap === 0) return null;

            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                MTVAxis = axis;
            }
        }

        for (let i = 0; i < other.verticies.length; i++) {
            let axis = otherMat.mul_vec2(other.verticies[i]).sub(otherMat.mul_vec2(other.verticies[i + 1 === other.verticies.length ? 0 : i + 1])).normalize().prep();
            let overlap = this.lineOverlap(...this.projectBodyRect(collider, axis), ...this.projectBodyRect(other, axis));

            if (overlap === 0) return null;

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

    private lineOverlap(p1min: number, p1max: number, p2min: number, p2max: number) {
        return Math.max(0, Math.min(p1max, p2max) - Math.max(p1min, p2min));
    }
}

export class Collision {
    constructor(public collider: Collider, public other: Collider, public mvt: Vec2) { }
}