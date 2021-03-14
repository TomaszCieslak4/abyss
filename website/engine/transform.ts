import { Script } from "./script.js";
import { Vec2 } from "./vector.js";

export class Transform extends Script {
    public position: Vec2 = Vec2.zero();
    public rotation: Vec2 = Vec2.one();
    public scale: Vec2 = Vec2.one();
}