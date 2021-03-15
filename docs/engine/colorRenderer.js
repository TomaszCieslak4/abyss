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
import { RectCollider } from "./rectCollider.js";
import { SceneManager } from "./sceneManager.js";
import { Transform } from "./transform.js";
export class ColorData extends IComponentData {
    constructor(color = new Color()) {
        super();
        this.color = color;
    }
}
export class ColorRendererJob extends IJob {
    execute(index, colors, transforms, colliders) {
        SceneManager.context.save();
        SceneManager.context.translate(transforms[index].position.x, transforms[index].position.y);
        SceneManager.context.rotate(transforms[index].rotation);
        SceneManager.context.strokeStyle = colors[index].color.toColorString();
        SceneManager.context.fillStyle = colors[index].color.toColorString();
        SceneManager.context.fillRect(-transforms[index].scale.x, -transforms[index].scale.y, transforms[index].scale.x * 2, transforms[index].scale.y * 2);
        // SceneManager.context.beginPath();
        // SceneManager.context.moveTo(colliders[index].corner[0].x, colliders[index].corner[0].y);
        // SceneManager.context.lineTo(colliders[index].corner[1].x, colliders[index].corner[1].y);
        // SceneManager.context.lineTo(colliders[index].corner[2].x, colliders[index].corner[2].y);
        // SceneManager.context.lineTo(colliders[index].corner[3].x, colliders[index].corner[3].y);
        // SceneManager.context.lineTo(colliders[index].corner[0].x, colliders[index].corner[0].y);
        // SceneManager.context.fill();
        SceneManager.context.restore();
    }
}
__decorate([
    Job(ColorData, Transform, RectCollider)
], ColorRendererJob.prototype, "execute", null);
export class ColorRendererSystem extends IComponentSystem {
    onDraw() {
        let job = new ColorRendererJob();
        job.schedule();
    }
}
