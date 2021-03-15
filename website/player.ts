import { timers } from "jquery";
import { IComponentData } from "./engine/component.js";
import { IComponentSystem } from "./engine/ecs/componentSystem.js";
import { IJob, Job } from "./engine/ecs/job.js";
import { Input } from "./engine/input.js";
import { RigidBody } from "./engine/rigidbody.js";
import { SceneManager } from "./engine/sceneManager.js";
import { Time } from "./engine/time.js";
import { Transform } from "./engine/transform.js";

export class Player extends IComponentData {
    constructor(
        public speed: number = 100
    ) { super() }
}

export class PlayerJob extends IJob {

    @Job(Player, RigidBody, Transform)
    execute(index: number, players: Player[], rigidBodies: RigidBody[], transforms: Transform[]) {
        rigidBodies[index].velocity.set_s(
            Input.getAxis("x") * -players[index].speed,
            Input.getAxis("y") * -players[index].speed
        );

        let v = transforms[index].position.sub(Input.mousePos);
        transforms[index].rotation = Math.atan2(v.y, v.x);

        if (Input.getButton("fire")) {
            console.log("DOWN");
        }
    }
}

export class PlayerSystem extends IComponentSystem {
    onUpdate() {
        let job = new PlayerJob();
        job.schedule();
    }
}