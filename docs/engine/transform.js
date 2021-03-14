import { Script } from "./script.js";
import { Vec2 } from "./vector.js";
export class Transform extends Script {
    constructor() {
        super(...arguments);
        this.position = Vec2.zero();
        this.rotation = Vec2.one();
        this.scale = Vec2.one();
    }
}
