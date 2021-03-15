import { IComponentData } from "./component.js";
import { Vec2 } from "./vector.js";
export class RectCollider extends IComponentData {
    constructor(
    /** Corners of the box, where 0 is the lower left. */
    corner = [Vec2.zero(), Vec2.zero(), Vec2.zero(), Vec2.zero()], 
    /** Two edges of the box extended away from corner[0]. */
    axis = [Vec2.zero(), Vec2.zero()], 
    /** origin[a] = corner[0].dot(axis[a]); */
    origin = [0]) {
        super();
        this.corner = corner;
        this.axis = axis;
        this.origin = origin;
    }
}
