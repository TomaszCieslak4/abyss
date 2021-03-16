import { Component, IComponentData } from "../component.js";
import { IComponentSystem } from "../componentSystem.js";
import { IJobForEach, JobForEach } from "../job.js";

// Components
import { Transform } from "./transform.js";
import { RectCollider } from "./rectCollider.js";
import { SceneManager } from "../../sceneManager.js";

@Component
export class Sprite extends IComponentData {
    constructor(
        public sprite: HTMLImageElement = new Image()
    ) { super() }
}

@JobForEach(Sprite, Transform, RectCollider)
export class SpriteRendererJob extends IJobForEach {

    execute(sprite: Sprite, transform: Transform, collider: RectCollider) {
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

            SceneManager.context.fillRect(
                -transform.scale.x,
                -transform.scale.y,
                transform.scale.x * 2,
                transform.scale.y * 2
            );
            SceneManager.context.restore();
            return;
        }

        SceneManager.context.drawImage(
            sprite.sprite,
            -transform.scale.x,
            -transform.scale.y,
            transform.scale.x * 2,
            transform.scale.y * 2
        );
        SceneManager.context.restore();
    }
}

export class SpriteRendererSystem extends IComponentSystem {
    onUpdate() {
        let job = new SpriteRendererJob();
        job.run();
    }
}