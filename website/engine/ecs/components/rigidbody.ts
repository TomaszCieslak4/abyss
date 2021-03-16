import { Component, IComponentData } from "../component.js";
import { IComponentSystem } from "../componentSystem.js";
import { IJobForEach, IJobForEachWithEntity, JobForEach } from "../job.js";
import { EntityGroup, EntityID, EntityManager } from "../entity.js";
import { Time } from "../../time.js";
import { Vec2 } from "../../math/vector.js";

// Components
import { Transform } from "./transform.js";
import { RectCollider } from "./rectCollider.js";

@Component
export class CollisionEvent extends IComponentData {
    constructor(
        public entity: EntityID,
        public other: EntityID,
    ) { super() }
}

@Component
export class RigidBody extends IComponentData {
    constructor(
        public velocity: Vec2 = Vec2.zero(),
        public torque: number = 0
    ) { super(); }
}

@JobForEach(Transform, RigidBody)
export class RigidBodyVelocityJob extends IJobForEach {

    execute(transform: Transform, ridgidBody: RigidBody) {
        transform.position.i_add(ridgidBody.velocity.mul_s(Time.fixedDeltaTime));
        // transforms[index].rotation = (transforms[index].rotation + ridgidBody[index].torque * Time.fixedDeltaTime) % (2 * Math.PI);
    }
}

@JobForEach(RectCollider, Transform)
export class RigidBodyComputeJob extends IJobForEach {

    execute(collider: RectCollider, transform: Transform) {
        let x = new Vec2(Math.cos(transform.rotation), -Math.sin(transform.rotation));
        let y = new Vec2(Math.sin(transform.rotation), Math.cos(transform.rotation));

        x.i_mul_s(transform.scale.x);
        y.i_mul_s(transform.scale.y);

        collider.corner[0] = transform.position.sub(x).i_sub(y);
        collider.corner[1] = transform.position.add(x).i_sub(y);
        collider.corner[2] = transform.position.add(x).i_add(y);
        collider.corner[3] = transform.position.sub(x).i_add(y);


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

@JobForEach(RigidBody, Transform, RectCollider)
export class RigidBodyCollisionJob extends IJobForEachWithEntity {
    constructor(public colliders: RectCollider[], public entities: EntityGroup) { super(); }

    execute(entity: EntityID, index: number, rigidBody: RigidBody, transform: Transform, collider: RectCollider) {
        for (const other of this.entities) {
            if (EntityManager.isSameEntity(entity, other)) continue;

            let MTVAxis = this.overlaps(collider, this.colliders[other.index]);
            if (MTVAxis) {
                transform.position.i_add(MTVAxis);
                let ent = EntityManager.createEntity();
                EntityManager.addComponent(ent, CollisionEvent);
                EntityManager.setComponentData(ent, new CollisionEvent(entity, other));
            }
        }
    }

    private projectBodyRect(collider: RectCollider, axis: Vec2): [number, number] {
        let min = Infinity;
        let max = -Infinity;

        for (let j = 0; j < collider.corner.length; j++) {
            let t = collider.corner[j].dot(axis);
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

    // private projectBodyCicle(collider: CircleCollider, axis: Vec2) {
    //     let t = collider.position.dot(axis);       

    //     return [t - collider.position.scale.x, t + collider.position.scale.x];
    // }

    /** Returns true if other overlaps one dimension of this. */
    private overlaps(collider: RectCollider, other: RectCollider) {
        let smallestOverlap = Infinity;
        let MTVAxis = Vec2.zero();

        for (let i = 0; i < collider.corner.length; i++) {
            let axis = collider.corner[i].sub(collider.corner[i + 1 === collider.corner.length ? 0 : i + 1]).normalize().prep();
            let overlap = this.lineOverlap(...this.projectBodyRect(collider, axis), ...this.projectBodyRect(other, axis));

            if (overlap === 0) return null;

            if (overlap < smallestOverlap) {
                smallestOverlap = overlap;
                MTVAxis = axis;
            }
        }

        for (let i = 0; i < other.corner.length; i++) {
            let axis = other.corner[i].sub(other.corner[i + 1 === other.corner.length ? 0 : i + 1]).normalize().prep();
            let overlap = this.lineOverlap(...this.projectBodyRect(collider, axis), ...this.projectBodyRect(other, axis));

            if (overlap === 0) return null;

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

    private lineOverlap(p1min: number, p1max: number, p2min: number, p2max: number) {
        return Math.max(0, Math.min(p1max, p2max) - Math.max(p1min, p2min));
    }
}

export class RigidBodySystem extends IComponentSystem {

    onFixedUpdate() {
        let velocityJob = new RigidBodyVelocityJob();
        velocityJob.scheduleParallel();

        let rigidBodyComputeJob = new RigidBodyComputeJob();
        rigidBodyComputeJob.scheduleParallel();

        let colliders = EntityManager.getComponents(RectCollider);
        let entities = EntityManager.getEntitiesWithComponents([RectCollider]);

        let collisionJob = new RigidBodyCollisionJob(colliders, entities);
        collisionJob.scheduleParallel();
    }
}

@JobForEach(CollisionEvent)
export class CleanupJob extends IJobForEachWithEntity {

    execute(entity: EntityID, index: number, collison: CollisionEvent) {
        EntityManager.destroyEntity(entity);
    }
}

export class CleanupSystem extends IComponentSystem {

    onFixedUpdate() {
        let cleanupJob = new CleanupJob();
        cleanupJob.scheduleParallel();
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