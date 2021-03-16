var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, IComponentData } from "./ecs/component.js";
import { Vec2 } from "./vector.js";
let RectCollider = class RectCollider extends IComponentData {
    constructor(
    /** Corners of the box, where 0 is the lower left. */
    corner = [Vec2.zero(), Vec2.zero(), Vec2.zero(), Vec2.zero()], 
    /** Two edges of the box extended away from corner[0]. */
    axis = [Vec2.zero(), Vec2.zero()], 
    /** origin[a] = corner[0].dot(axis[a]); */
    origin = [0]) {
        super();
        this.corner = corner;
        this.axis = axis;
        this.origin = origin;
    }
};
RectCollider = __decorate([
    Component
], RectCollider);
export { RectCollider };
