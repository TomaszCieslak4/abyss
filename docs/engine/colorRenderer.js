var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Color } from "./color.js";
import { IComponentData } from "./component.js";
import { IComponentSystem } from "./ecs/componentSystem.js";
import { IJob, Job } from "./ecs/job.js";
import { SceneManager } from "./sceneManager.js";
import { Transform } from "./transform.js";
export class ColorData extends IComponentData {
    constructor(color = new Color()) {
        super();
        this.color = color;
    }
}
export class ColorRendererJob extends IJob {
    execute(index, colors, transforms) {
        SceneManager.context.fillStyle = colors[index].color.toColorString();
        SceneManager.context.fillRect(transforms[index].position.x - transforms[index].scale.x, transforms[index].position.y - transforms[index].scale.y, transforms[index].scale.x * 2, transforms[index].scale.y * 2);
    }
}
__decorate([
    Job(ColorData, Transform)
], ColorRendererJob.prototype, "execute", null);
export class ColorRendererSystem extends IComponentSystem {
    onDraw() {
        let job = new ColorRendererJob();
        job.schedule();
    }
}
