import { Script } from "../script/script.js";;
import { Vec2 } from "../util/vector.js";
import { Collision } from "./rigidbody.js";

export class Collider extends Script {
    isTrigger: boolean = false;
    collisions: Collision[] = [];
}