import { Component, IComponentData } from "../component.js";
import { IComponentSystem } from "../componentSystem.js";
import { IJobForEach, JobForEach } from "../job.js";
import { Color } from "../../math/color.js";

// Components
import { Transform } from "./transform.js";
import { RectCollider } from "./rectCollider.js";
import { SceneManager } from "../../sceneManager.js";

@Component
export class ColorData extends IComponentData {
    constructor(
        public color: Color = new Color()
    ) { super() }
}

@JobForEach(ColorData, Transform, RectCollider)
export class ColorRendererJob extends IJobForEach {

    execute(color: ColorData, transform: Transform, collider: RectCollider) {
        SceneManager.context.save();
        SceneManager.context.translate(transform.position.x, transform.position.y);
        SceneManager.context.rotate(transform.rotation);

        SceneManager.context.strokeStyle = color.color.toColorString();
        SceneManager.context.fillStyle = color.color.toColorString();
        SceneManager.context.fillRect(
            -transform.scale.x,
            -transform.scale.y,
            transform.scale.x * 2,
            transform.scale.y * 2
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
    onUpdate() {
        let job = new ColorRendererJob();
        job.scheduleParallel();
    }
}