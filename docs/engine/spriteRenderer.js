var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { IComponentData } from "./component.js";
import { IComponentSystem } from "./ecs/componentSystem.js";
import { IJob, Job } from "./ecs/job.js";
import { SceneManager } from "./sceneManager.js";
import { Transform } from "./transform.js";
export class Sprite extends IComponentData {
    constructor(sprite = new Image()) {
        super();
        this.sprite = sprite;
    }
}
export class SpriteRendererJob extends IJob {
    execute(index, sprites, transforms) {
        SceneManager.context.save();
        SceneManager.context.translate(transforms[index].position.x, transforms[index].position.y);
        SceneManager.context.rotate(transforms[index].rotation);
        if (!sprites[index].sprite.complete || sprites[index].sprite.naturalWidth === 0) {
            SceneManager.context.fillStyle = "magenta";
            SceneManager.context.fillRect(-transforms[index].scale.x, -transforms[index].scale.y, transforms[index].scale.x * 2, transforms[index].scale.y * 2);
            SceneManager.context.restore();
            return;
        }
        SceneManager.context.drawImage(sprites[index].sprite, -transforms[index].scale.x, -transforms[index].scale.y, transforms[index].scale.x * 2, transforms[index].scale.y * 2);
        SceneManager.context.restore();
    }
}
__decorate([
    Job(Sprite, Transform)
], SpriteRendererJob.prototype, "execute", null);
export class SpriteRendererSystem extends IComponentSystem {
    onDraw() {
        let job = new SpriteRendererJob();
        job.schedule();
    }
}
