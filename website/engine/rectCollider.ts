import { IComponentData } from "./component.js";
import { Vec2 } from "./vector.js";

export class RectCollider extends IComponentData {
    constructor(
        /** Corners of the box, where 0 is the lower left. */
        public corner: Vec2[] = [Vec2.zero(), Vec2.zero(), Vec2.zero(), Vec2.zero()],

        /** Two edges of the box extended away from corner[0]. */
        public axis: Vec2[] = [Vec2.zero(), Vec2.zero()],

        /** origin[a] = corner[0].dot(axis[a]); */
        public origin: number[] = [0]
    ) { super() }
}