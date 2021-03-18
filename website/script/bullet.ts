import { Camera } from "../core/camera.js";
import { Input } from "../util/input.js";
import { Vec2 } from "../util/vector.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Transform } from "../core/transform.js";
import { Script } from "./script.js";
import { GameObject } from "../core/gameObject.js";
import { Time } from "../util/time.js";

export class Bullet extends Script {
    private rigidBody!: RigidBody;
    private startPos: Vec2 = Vec2.zero();
    private maxDistance: number = 10;
    public spawnpoint!: GameObject;

    start() {
        this.startPos = this.gameObject.transform.position;
    }

    update() {
        if (this.gameObject.transform.position.sqr_dist(this.startPos) > this.maxDistance * this.maxDistance) {
            this.gameObject.destroy(this.gameObject);
        }
    }

    fixedUpdate() {
        // this.rigidBody.velocity = Vec2.lerp(this.rigidBody.velocity, this.gameObject.transform.position.sub(Camera.main.viewportToWorld().mul_vec2(Input.mousePos)).normalize().mul_s(-10), 0.2);
    }

    onCollisionEnter() {
        this.gameObject.destroy(this.gameObject);
    }
}