import { Script } from "../script/script.js";
import { GameObject } from "../core/gameObject.js";
import { Transform } from "../core/transform.js";
import { Vec2 } from "../util/vector.js";

/** OBB Intersection Algorithm
 *  src: https://www.flipcode.com/archives/2D_OBB_Intersection.shtml
 */
export class RectCollider extends Script {
    transform: Transform;

    /** Corners of the box, where 0 is the lower left. */
    corner: Vec2[] = [Vec2.zero(), Vec2.zero(), Vec2.zero(), Vec2.zero()];

    /** Two edges of the box extended away from corner[0]. */
    axis: Vec2[] = [Vec2.zero(), Vec2.zero()];

    /** origin[a] = corner[0].dot(axis[a]); */
    origin: number[] = [0];

    constructor(public gameObject: GameObject) {
        super(gameObject);
        this.transform = this.gameObject.getComponent(Transform) as Transform;
    }


    // constructor(center: Vec2, public size: Vec2, angle: number) {
    //     let x = new Vec2(Math.cos(angle), Math.sin(angle));
    //     let y = new Vec2(-Math.sin(angle), Math.cos(angle));

    //     x.i_mul_s(size.x / 2);
    //     y.i_mul_s(size.y / 2);

    //     this.corner[0] = center.sub(x).i_sub(y);
    //     this.corner[1] = center.add(x).i_sub(y);
    //     this.corner[2] = center.add(x).i_add(y);
    //     this.corner[3] = center.sub(x).i_add(y);

    //     this.computeAxes();
    // }

    /** Returns true if other overlaps one dimension of this. */
    private overlaps1Way(other: RectCollider): boolean {
        for (let a = 0; a < 2; ++a) {
            let t = other.corner[0].dot(this.axis[a]);

            // Find the extent of box 2 on axis a
            let tMin = t;
            let tMax = t;

            for (let c = 1; c < 4; ++c) {
                t = other.corner[c].dot(this.axis[a]);

                if (t < tMin) {
                    tMin = t;
                } else if (t > tMax) {
                    tMax = t;
                }
            }

            // We have to subtract off the origin

            // See if [tMin, tMax] intersects [0, 1]
            if ((tMin > 1 + this.origin[a]) || (tMax < this.origin[a])) {
                // There was no intersection along this dimension;
                // the boxes cannot possibly overlap.
                return false;
            }
        }

        // There was no dimension along which there is no intersection.
        // Therefore the boxes overlap.
        return true;
    }


    /** Updates the axes after the corners move.  Assumes the
        corners actually form a rectangle. */
    private computeAxes(): void {
        this.axis[0] = this.corner[1].sub(this.corner[0]);
        this.axis[1] = this.corner[3].sub(this.corner[0]);

        // Make the length of each axis 1/edge length so we know any
        // dot product must be less than 1 to fall within the edge.

        for (let a = 0; a < 2; ++a) {
            this.axis[a].i_div_s(this.axis[a].sqr_magnitude());
            this.origin[a] = this.corner[0].dot(this.axis[a]);
        }
    }

    /** For testing purposes. */
    public moveTo(center: Vec2): void {
        let centroid = this.corner[0].add(this.corner[1]).i_add(this.corner[2]).i_add(this.corner[3]).i_div_s(4);
        let translation = center.sub(centroid);

        for (let c = 0; c < 4; ++c) {
            this.corner[c].i_add(translation);
        }

        this.computeAxes();
    }

    /** Returns true if the intersection of the boxes is non-empty. */
    public overlaps(other: RectCollider): boolean {
        return this.overlaps1Way(other) && other.overlaps1Way(this);
    }
}