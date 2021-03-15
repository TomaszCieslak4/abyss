var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { IComponentData } from "./engine/component.js";
import { IComponentSystem } from "./engine/ecs/componentSystem.js";
import { IJob, Job } from "./engine/ecs/job.js";
import { Input } from "./engine/input.js";
import { RigidBody } from "./engine/rigidbody.js";
import { Time } from "./engine/time.js";
import { Transform } from "./engine/transform.js";
export class Player extends IComponentData {
    constructor(speed = 100) {
        super();
        this.speed = speed;
    }
}
export class PlayerJob extends IJob {
    execute(index, players, rigidBodies, transforms) {
        rigidBodies[index].velocity.set_s(Input.getAxis("x") * -players[index].speed, Input.getAxis("y") * -players[index].speed);
        let v = transforms[index].position.sub(Input.mousePos);
        let rotation = (Math.atan2(v.y, v.x) - transforms[index].rotation) % (2 * Math.PI);
        rigidBodies[index].torque = rotation > Math.PI ? Math.PI - rotation : rotation / Time.fixedDeltaTime;
        if (Input.getButton("fire")) {
            console.log("DOWN");
        }
    }
}
__decorate([
    Job(Player, RigidBody, Transform)
], PlayerJob.prototype, "execute", null);
export class PlayerSystem extends IComponentSystem {
    onUpdate() {
        let job = new PlayerJob();
        job.schedule();
    }
}
