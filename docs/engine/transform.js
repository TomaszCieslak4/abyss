import { IComponentData } from "./component.js";
import { Vec2 } from "./vector.js";
export class Transform extends IComponentData {
    constructor(position = Vec2.zero(), rotation = 0, scale = Vec2.one()) {
        super();
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    }
}
