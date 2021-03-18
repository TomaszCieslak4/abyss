import { Script } from "../script/script.js";
;
import { Vec2 } from "../util/vector.js";
export class BoxCollider extends Script {
    constructor() {
        super(...arguments);
        this.isTrigger = false;
        this.verticies = [new Vec2(-0.5, -0.5), new Vec2(0.5, -0.5), new Vec2(0.5, 0.5), new Vec2(-0.5, 0.5)];
    }
}
