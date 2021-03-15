import { Color } from "./color.js";
import { IComponentData } from "./component.js";
import { IComponentSystem } from "./ecs/componentSystem.js";
import { IJob, Job } from "./ecs/job.js";
import { RectCollider } from "./rectCollider.js";
import { SceneManager } from "./sceneManager.js";
import { Transform } from "./transform.js";

export class ColorData extends IComponentData {
    constructor(
        public color: Color = new Color()
    ) { super() }
}

export class ColorRendererJob extends IJob {
    @Job(ColorData, Transform, RectCollider)
    execute(index: number, colors: ColorData[], transforms: Transform[], colliders: RectCollider[]) {
        SceneManager.context.save();
        SceneManager.context.translate(transforms[index].position.x, transforms[index].position.y);
        SceneManager.context.rotate(transforms[index].rotation);

        SceneManager.context.strokeStyle = colors[index].color.toColorString();
        SceneManager.context.fillStyle = colors[index].color.toColorString();
        SceneManager.context.fillRect(
            -transforms[index].scale.x,
            -transforms[index].scale.y,
            transforms[index].scale.x * 2,
            transforms[index].scale.y * 2
        );

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

export class ColorRendererSystem extends IComponentSystem {
    onDraw() {
        let job = new ColorRendererJob();
        job.schedule();
    }
}