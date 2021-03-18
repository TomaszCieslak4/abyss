import { Script } from "../script/script.js";;
import { Vec2 } from "../util/vector.js";

export class BoxCollider extends Script {
    isTrigger: boolean = false;
    verticies: Vec2[] = [new Vec2(-0.5, -0.5), new Vec2(0.5, -0.5), new Vec2(0.5, 0.5), new Vec2(-0.5, 0.5)];
}