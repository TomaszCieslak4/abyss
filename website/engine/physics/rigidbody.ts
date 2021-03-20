import { GameObject } from "../core/gameObject.js";
import { SceneManager } from "../core/sceneManager.js";
import { Script } from "../core/script.js";
import { Time } from "../util/time.js";
import { Vec2 } from "../util/vector.js";
import { BoxCollider } from "./boxCollider.js";
import { CircleCollider } from "./circleCollider.js";
import { Collider } from "./collider.js";

export class RigidBody extends Script {
    velocity: Vec2 = Vec2.zero();
    collisions: Collision[] = [];

    fixedUpdate() {
        // Update position
        this.gameObject.transform.position = this.gameObject.transform.position.add(this.velocity.mul_s(Time.fixedDeltaTime));

        // Find collisions 
        let newCollisions = [];
        for (const collider of this.gameObject.getComponentsInChildren(Collider)) {
            for (const otherCollider of SceneManager.activeScene.findComponents(Collider)) {
                if (otherCollider.isTrigger) continue;

                let otherRoot = otherCollider.gameObject.transform.root;
                if (this.gameObject.transform === otherRoot) continue;

                let collision: Collision | null = null;
                if (collider instanceof CircleCollider) {
                    if (otherCollider instanceof CircleCollider) {

                        let diff = otherCollider.gameObject.transform.position.sub(collider.gameObject.transform.position);
                        let radius = (otherCollider.gameObject.transform.scale.x + collider.gameObject.transform.scale.x) / 2;
                        let sqr_mag = diff.sqr_magnitude();

                        if (sqr_mag < radius * radius) {
                            let normDiff = diff.div_s(Math.sqrt(sqr_mag));
                            collision = new Collision(
                                otherCollider,
                                normDiff.mul_s(Math.sqrt(sqr_mag) - radius),
                                normDiff.mul_s(otherCollider.gameObject.transform.scale.x),
                                otherRoot.gameObject,
                                collider,
                            );
                        }
                    } else if (otherCollider instanceof BoxCollider) {
                        collision = this.circleRectIntersects(collider, otherCollider);
                    }
                }

                if (!collision) continue;
                if (!collider.isTrigger) this.gameObject.transform.position = this.gameObject.transform.position.add(collision.correctionVector);

                // Populate collision info
                collision.collider = otherCollider;
                collision.source = collider;
                collision.gameObject = otherRoot.gameObject;

                newCollisions.push(collision);
            }
        }

        // Diff collisions
        for (let i = 0; i < newCollisions.length; i++) {
            const collision = newCollisions[i];

            // Eliminate duplicates
            let duplicate = false;
            for (let j = 0; j < i; j++) {
                if (
                    collision.gameObject === newCollisions[j].gameObject &&
                    collision.source.isTrigger === newCollisions[j].source.isTrigger &&
                    collision.collider.isTrigger === newCollisions[j].collider.isTrigger
                ) {
                    duplicate = true;
                    break;
                }
            }
            if (duplicate) continue;

            // Check for old collison
            let found = false;
            for (let j = 0; j < this.collisions.length; j++) {
                if (
                    collision.gameObject === this.collisions[j].gameObject &&
                    collision.source.isTrigger === this.collisions[j].source.isTrigger &&
                    collision.collider.isTrigger === this.collisions[j].collider.isTrigger
                ) {
                    found = true;
                    this.collisions.splice(j, 1);
                    break;
                }
            }

            // Collision notifications
            for (const comp of this.gameObject.getComponents(Script)) {
                if (!found) {
                    if (collision.source.isTrigger) {
                        comp.onTriggerEnter(collision);
                    } else {
                        comp.onCollisionEnter(collision);
                    }
                }

                if (collision.source.isTrigger) {
                    comp.onTriggerStay(collision);
                } else {
                    comp.onCollisionStay(collision);
                }
            }
        }

        // Collision over
        for (const collision of this.collisions) {
            for (const comp of this.gameObject.getComponents(Script)) {
                if (collision.source.isTrigger) {
                    comp.onTriggerExit(collision.collider, collision.gameObject);
                } else {
                    comp.onCollisionExit(collision.collider, collision.gameObject);
                }
            }
        }

        this.collisions = newCollisions;
    }

    circleRectIntersects(circle: CircleCollider, rect: BoxCollider): Collision | null {
        let circlePos = circle.gameObject.transform.position;
        let circleRadius = circle.gameObject.transform.scale.x / 2;
        let rectPos = rect.gameObject.transform.position;
        let rectScale = rect.gameObject.transform.scale.div_s(2);

        let closest = circlePos.clamp(rectPos.sub(rectScale), rectPos.add(rectScale));
        let diff = circlePos.sub(closest);
        let dist = diff.sqr_magnitude();

        if (dist >= (circleRadius * circleRadius)) return null;
        return new Collision(rect,
            diff.normalize().mul_s(circleRadius - Math.sqrt(dist)),
            closest,
            rect.gameObject,
            circle);
    }
}

export class Collision {
    constructor(
        public collider: Collider,
        public correctionVector: Vec2,
        public contactPoint: Vec2,
        public gameObject: GameObject,
        public source: Collider
    ) { }
}