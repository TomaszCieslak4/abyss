import { Vec2 } from "../util/vector.js";
import { Collider } from "./collider.js";
export class BoxCollider extends Collider {
    constructor() {
        super(...arguments);
        this.verticies = [new Vec2(-0.5, -0.5), new Vec2(0.5, -0.5), new Vec2(0.5, 0.5), new Vec2(-0.5, 0.5)];
    }
}
