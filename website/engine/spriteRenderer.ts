import { IComponentData } from "./component.js";
import { IComponentSystem } from "./ecs/componentSystem.js";
import { IJob, Job } from "./ecs/job.js";
import { SceneManager } from "./sceneManager.js";
import { Transform } from "./transform.js";

export class Sprite extends IComponentData {
    constructor(
        public sprite: HTMLImageElement = new Image()
    ) { super() }
}

export class SpriteRendererJob extends IJob {

    @Job(Sprite, Transform)
    execute(index: number, sprites: Sprite[], transforms: Transform[]) {
        SceneManager.context.save();
        SceneManager.context.translate(transforms[index].position.x, transforms[index].position.y);
        SceneManager.context.rotate(transforms[index].rotation);

        if (!sprites[index].sprite.complete || sprites[index].sprite.naturalWidth === 0) {
            SceneManager.context.fillStyle = "magenta";
            SceneManager.context.fillRect(
                -transforms[index].scale.x,
                -transforms[index].scale.y,
                transforms[index].scale.x * 2,
                transforms[index].scale.y * 2
            );
            SceneManager.context.restore();
            return;
        }

        SceneManager.context.drawImage(
            sprites[index].sprite,
            -transforms[index].scale.x,
            -transforms[index].scale.y,
            transforms[index].scale.x * 2,
            transforms[index].scale.y * 2
        );
        SceneManager.context.restore();
    }
}

export class SpriteRendererSystem extends IComponentSystem {
    onDraw() {
        let job = new SpriteRendererJob();
        job.schedule();
    }
}