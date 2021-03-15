import { IComponentData } from "./component.js";
import { Vec2 } from "./vector.js";

export class Transform extends IComponentData {
    constructor(
        public position: Vec2 = Vec2.zero(),
        public rotation: number = 0,
        public scale: Vec2 = Vec2.one()
    ) { super(); }
}