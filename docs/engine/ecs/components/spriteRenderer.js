var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, IComponentData } from "../component.js";
import { IComponentSystem } from "../componentSystem.js";
import { IJobForEach, JobForEach } from "../job.js";
// Components
import { Transform } from "./transform.js";
import { RectCollider } from "./rectCollider.js";
import { SceneManager } from "../../sceneManager.js";
let Sprite = class Sprite extends IComponentData {
    constructor(sprite = new Image()) {
        super();
        this.sprite = sprite;
    }
};
Sprite = __decorate([
    Component
], Sprite);
export { Sprite };
let SpriteRendererJob = class SpriteRendererJob extends IJobForEach {
    execute(sprite, transform, collider) {
        SceneManager.context.save();
        SceneManager.context.translate(transform.position.x, transform.position.y);
        SceneManager.context.rotate(transform.rotation);
        if (!sprite.sprite.complete || sprite.sprite.naturalWidth === 0) {
            SceneManager.context.fillStyle = "magenta";
            // SceneManager.context.beginPath();
            // SceneManager.context.moveTo(colliders[index].corner[0].x, colliders[index].corner[0].y);
            // SceneManager.context.lineTo(colliders[index].corner[1].x, colliders[index].corner[1].y);
            // SceneManager.context.lineTo(colliders[index].corner[2].x, colliders[index].corner[2].y);
            // SceneManager.context.lineTo(colliders[index].corner[3].x, colliders[index].corner[3].y);
            // SceneManager.context.lineTo(colliders[index].corner[0].x, colliders[index].corner[0].y);
            // SceneManager.context.fill();
            // SceneManager.context.restore();
            SceneManager.context.fillRect(-transform.scale.x, -transform.scale.y, transform.scale.x * 2, transform.scale.y * 2);
            SceneManager.context.restore();
            return;
        }
        SceneManager.context.drawImage(sprite.sprite, -transform.scale.x, -transform.scale.y, transform.scale.x * 2, transform.scale.y * 2);
        SceneManager.context.restore();
    }
};
SpriteRendererJob = __decorate([
    JobForEach(Sprite, Transform, RectCollider)
], SpriteRendererJob);
export { SpriteRendererJob };
export class SpriteRendererSystem extends IComponentSystem {
    onUpdate() {
        let job = new SpriteRendererJob();
        job.run();
    }
}
