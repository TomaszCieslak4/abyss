var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { IComponentData } from "./component.js";
import { IComponentSystem } from "./ecs/componentSystem.js";
import { EntityManager } from "./ecs/entity.js";
import { IJob, Job } from "./ecs/job.js";
import { RectCollider } from "./rectCollider.js";
import { Time } from "./time.js";
import { Transform } from "./transform.js";
import { Vec2 } from "./vector.js";
export class RigidBody extends IComponentData {
    constructor(velocity = Vec2.zero(), torque = 0) {
        super();
        this.velocity = velocity;
        this.torque = torque;
    }
}
export class RigidBodyVelocityJob extends IJob {
    execute(index, transforms, ridgidBody) {
        transforms[index].position.i_add(ridgidBody[index].velocity.mul_s(Time.fixedDeltaTime));
        // transforms[index].rotation = (transforms[index].rotation + ridgidBody[index].torque * Time.fixedDeltaTime) % (2 * Math.PI);
    }
}
__decorate([
    Job(Transform, RigidBody)
], RigidBodyVelocityJob.prototype, "execute", null);
export class RigidBodyComputeJob extends IJob {
    execute(index, colliders, transforms) {
        let x = new Vec2(Math.cos(transforms[index].rotation), -Math.sin(transforms[index].rotation));
        let y = new Vec2(Math.sin(transforms[index].rotation), Math.cos(transforms[index].rotation));
        x.i_mul_s(transforms[index].scale.x);
        y.i_mul_s(transforms[index].scale.y);
        colliders[index].corner[0] = transforms[index].position.sub(x).i_sub(y);
        colliders[index].corner[1] = transforms[index].position.add(x).i_sub(y);
        colliders[index].corner[2] = transforms[index].position.add(x).i_add(y);
        colliders[index].corner[3] = transforms[index].position.sub(x).i_add(y);
        // colliders[index].axis[0] = colliders[index].corner[1].sub(colliders[index].corner[0]);
        // colliders[index].axis[1] = colliders[index].corner[3].sub(colliders[index].corner[0]);
        // // Make the length of each axis 1/edge length so we know any
        // // dot product must be less than 1 to fall within the edge.
        // for (let a = 0; a < 2; ++a) {
        //     colliders[index].axis[a].normalize();
        //     colliders[index].origin[a] = colliders[index].corner[0].dot(colliders[index].axis[a]);
        // }
    }
}
__decorate([
    Job(RectCollider, Transform)
], RigidBodyComputeJob.prototype, "execute", null);
export class RigidBodyCollisionJob extends IJob {
    constructor(colliders) {
        super();
        this.colliders = colliders;
    }
    execute(index, rigidBodies, transforms, colliders) {
        for (let i = 0; i < this.colliders.length; i++) {
            if (colliders[index] !== this.colliders[i]) {
                let MTVAxis = this.overlaps(colliders[index], this.colliders[i]);
                if (MTVAxis) {
                    console.log("Collision");
                    transforms[index].position.i_add(MTVAxis);
                }
            }
        }
    }
    projectBodyRect(collider, axis) {
        let min = Infinity;
        let max = -Infinity;
        for (let j = 0; j < collider.corner.length; j++) {
            let t = collider.corner[j].dot(axis);
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
        for (let i = 0; i < collider.corner.length; i++) {
            let axis = collider.corner[i].sub(collider.corner[i + 1 === collider.corner.length ? 0 : i + 1]).normalize().prep();
            let overlap = this.lineOverlap(...this.projectBodyRect(collider, axis), ...this.projectBodyRect(other, axis));
            if (overlap === 0)
                return null;
            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                MTVAxis = axis;
            }
        }
        for (let i = 0; i < other.corner.length; i++) {
            let axis = other.corner[i].sub(other.corner[i + 1 === other.corner.length ? 0 : i + 1]).normalize().prep();
            let overlap = this.lineOverlap(...this.projectBodyRect(collider, axis), ...this.projectBodyRect(other, axis));
            if (overlap === 0)
                return null;
            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                MTVAxis = axis;
            }
        }
        if (MTVAxis.dot(other.corner[0].sub(collider.corner[0])) >= 0) {
            MTVAxis.i_mul_s(-1);
        }
        return MTVAxis.mul_s(smallestOverlap);
    }
    lineOverlap(p1min, p1max, p2min, p2max) {
        return Math.max(0, Math.min(p1max, p2max) - Math.max(p1min, p2min));
    }
}
__decorate([
    Job(RigidBody, Transform, RectCollider)
], RigidBodyCollisionJob.prototype, "execute", null);
export class RigidBodySystem extends IComponentSystem {
    onFixedUpdate() {
        let velocityJob = new RigidBodyVelocityJob();
        velocityJob.schedule();
        let rigidBodyComputeJob = new RigidBodyComputeJob();
        rigidBodyComputeJob.schedule();
        let colliders = EntityManager.getComponents([RectCollider])[0];
        let collisionJob = new RigidBodyCollisionJob(colliders);
        collisionJob.schedule();
    }
}
//  /** Returns true if other overlaps one dimension of this. */
//  private overlaps1Way(collider: RectCollider, other: RectCollider): boolean {
//     for (let a = 0; a < 2; ++a) {
//         let t = other.corner[0].dot(collider.axis[a]);
//         // Find the extent of box 2 on axis a
//         let tMin = t;
//         let tMax = t;
//         for (let c = 1; c < 4; ++c) {
//             t = other.corner[c].dot(collider.axis[a]);
//             if (t < tMin) {
//                 tMin = t;
//             } else if (t > tMax) {
//                 tMax = t;
//             }
//         }
//         // We have to subtract off the origin
//         // See if [tMin, tMax] intersects [0, 1]
//         if ((tMin > 1 + collider.origin[a]) || (tMax < collider.origin[a])) {
//             // There was no intersection along this dimension;
//             // the boxes cannot possibly overlap.
//             return false;
//         }
//     }
//     // There was no dimension along which there is no intersection.
//     // Therefore the boxes overlap.
//     return true;
// }
