import { Color } from "./color.js";
import { IComponentData } from "./component.js";
import { IComponentSystem } from "./ecs/componentSystem.js";
import { IJob, Job } from "./ecs/job.js";
import { SceneManager } from "./sceneManager.js";
import { Transform } from "./transform.js";

export class ColorData extends IComponentData {
    constructor(
        public color: Color = new Color()
    ) { super() }
}

export class ColorRendererJob extends IJob {
    @Job(ColorData, Transform)
    execute(index: number, colors: ColorData[], transforms: Transform[]) {
        SceneManager.context.fillStyle = colors[index].color.toColorString();
        SceneManager.context.fillRect(
            transforms[index].position.x - transforms[index].scale.x,
            transforms[index].position.y - transforms[index].scale.y,
            transforms[index].scale.x * 2,
            transforms[index].scale.y * 2
        );
    }
}

export class ColorRendererSystem extends IComponentSystem {
    onDraw() {
        let job = new ColorRendererJob();
        job.schedule();
    }
}