import { IComponentData } from "./component.js";
import { IComponentSystem } from "./ecs/componentSystem.js";
import { EntityManager } from "./ecs/entity.js";
import { IJob, Job } from "./ecs/job.js";
import { RectCollider } from "./rectCollider.js";
import { Time } from "./time.js";
import { Transform } from "./transform.js";
import { Vec2 } from "./vector.js";

export class RigidBody extends IComponentData {
    constructor(
        public velocity: Vec2 = Vec2.zero(),
        public torque: number = 0
    ) { super(); }
}

export class RigidBodyVelocityJob extends IJob {

    @Job(Transform, RigidBody)
    execute(index: number, transforms: Transform[], ridgidBody: RigidBody[]) {
        transforms[index].position.i_add(ridgidBody[index].velocity.mul_s(Time.fixedDeltaTime));
        transforms[index].rotation += ridgidBody[index].torque * Time.fixedDeltaTime;
    }
}

export class RigidBodyComputeJob extends IJob {

    @Job(RectCollider, Transform)
    execute(index: number, colliders: RectCollider[], transforms: Transform[]) {
        let x = new Vec2(Math.cos(transforms[index].rotation), Math.sin(transforms[index].rotation));
        let y = new Vec2(-Math.sin(transforms[index].rotation), Math.cos(transforms[index].rotation));

        x.i_mul_s(transforms[index].scale.x);
        y.i_mul_s(transforms[index].scale.y);

        colliders[index].corner[0] = transforms[index].position.sub(x).i_sub(y);
        colliders[index].corner[1] = transforms[index].position.add(x).i_sub(y);
        colliders[index].corner[2] = transforms[index].position.add(x).i_add(y);
        colliders[index].corner[3] = transforms[index].position.sub(x).i_add(y);

        colliders[index].axis[0] = colliders[index].corner[1].sub(colliders[index].corner[0]);
        colliders[index].axis[1] = colliders[index].corner[3].sub(colliders[index].corner[0]);

        // Make the length of each axis 1/edge length so we know any
        // dot product must be less than 1 to fall within the edge.
        for (let a = 0; a < 2; ++a) {
            colliders[index].axis[a].i_div_s(colliders[index].axis[a].sqr_magnitude());
            colliders[index].origin[a] = colliders[index].corner[0].dot(colliders[index].axis[a]);
        }
    }
}

export class RigidBodyCollisionJob extends IJob {
    constructor(public colliders: RectCollider[]) { super(); }

    @Job(RectCollider, RigidBody, Transform)
    execute(index: number, rigidBodies: RigidBody[], transforms: Transform[]) {
        for (let i = 0; i < this.colliders.length; i++) {
            if (i !== index && this.overlaps(this.colliders[index], this.colliders[i])) {
                console.log("COLLIDE");
            }
        }
    }

    /** Returns true if the intersection of the boxes is non-empty. */
    public overlaps(collider: RectCollider, other: RectCollider): boolean {
        return this.overlaps1Way(collider, other) && this.overlaps1Way(other, collider);
    }

    /** Returns true if other overlaps one dimension of this. */
    private overlaps1Way(collider: RectCollider, other: RectCollider): boolean {
        for (let a = 0; a < 2; ++a) {
            let t = other.corner[0].dot(collider.axis[a]);

            // Find the extent of box 2 on axis a
            let tMin = t;
            let tMax = t;

            for (let c = 1; c < 4; ++c) {
                t = other.corner[c].dot(collider.axis[a]);

                if (t < tMin) {
                    tMin = t;
                } else if (t > tMax) {
                    tMax = t;
                }
            }

            // We have to subtract off the origin

            // See if [tMin, tMax] intersects [0, 1]
            if ((tMin > 1 + collider.origin[a]) || (tMax < collider.origin[a])) {
                // There was no intersection along this dimension;
                // the boxes cannot possibly overlap.
                return false;
            }
        }

        // There was no dimension along which there is no intersection.
        // Therefore the boxes overlap.
        return true;
    }
}

export class RigidBodySystem extends IComponentSystem {

    onFixedUpdate() {
        let velocityJob = new RigidBodyVelocityJob();
        velocityJob.schedule();

        let rigidBodyComputeJob = new RigidBodyComputeJob();
        rigidBodyComputeJob.schedule();

        let colliders = EntityManager.getComponents([RectCollider])[0] as RectCollider[];

        let collisionJob = new RigidBodyCollisionJob(colliders);
        collisionJob.schedule();
    }
}