import { Component, IComponentData } from "./engine/ecs/component.js";
import { EntityID } from "./engine/ecs/entity.js";

@Component
export class Bullet extends IComponentData {
    constructor(
        public owner: EntityID
    ) { super() }
}