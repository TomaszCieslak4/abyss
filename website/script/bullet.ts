import { Camera } from "../core/camera.js";
import { Input } from "../util/input.js";
import { Vec2 } from "../util/vector.js";
import { Collision, RigidBody } from "../physics/rigidbody.js";
import { Transform } from "../core/transform.js";
import { Script } from "./script.js";
import { GameObject } from "../core/gameObject.js";
import { Time } from "../util/time.js";
import { Health } from "./health.js";

export class Bullet extends Script {
    private rigidBody!: RigidBody;
    private startPos: Vec2 = Vec2.zero();
    public maxDistance: number = 10;
    public spawnpoint!: GameObject;
    public damage: number = 1;

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

    onCollisionEnter(collision: Collision) {
        collision.other.gameObject.transform.root.gameObject.getComponent(Health)?.takeDamage(this.damage);
        this.gameObject.destroy(this.gameObject);
    }
}