import { Input } from "../util/input.js";
import { Collision, RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
import { Weapon } from "./weapon.js";
import { Vec2 } from "../util/vector.js";
import { Time } from "../util/time.js";
import { Camera } from "../core/camera.js";
import { Player } from "./player.js";
import { Transform } from "../core/transform.js";

enum AIState {
    TARGET_AQUISITION,
    PERSUIT,
    AMMO_AQUISITION
}

export class AIPlayer extends Player {
    target: Transform | null = null;
    state: AIState = AIState.TARGET_AQUISITION;
    persuitRange: number = 25;
    watchRange: number = 5;

    fixedUpdate() {
        if (!this.target || this.state !== AIState.PERSUIT) return;

        let targetDistance = this.target.position.sqr_dist(this.gameObject.transform.position);
        if (targetDistance > this.persuitRange * this.persuitRange) {
            this.state = AIState.TARGET_AQUISITION;
            this.target = null;
            this.rigidBody.velocity = Vec2.zero();
            return;
        }

        if (targetDistance < this.watchRange * this.watchRange) {
            this.rigidBody.velocity = Vec2.zero();
        } else {
            this.rigidBody.velocity = this.gameObject.transform.forward.mul_s(5);
        }

        let direction = this.target.position.sub(this.gameObject.transform.position).normalize();
        this.gameObject.transform.forward = direction.sub(this.gameObject.transform.forward).mul_s(0.05).add(this.gameObject.transform.forward);

        if (this.weapon &&
            targetDistance < this.weapon.getRange() * this.weapon.getRange() * 0.8 &&
            this.gameObject.transform.forward.sqr_dist(direction) < 0.3
        )
            this.weapon.shoot();
    }

    onTriggerEnter(collision: Collision) {
        if (collision.other.gameObject.transform.root.gameObject.tag === "Player" && this.state === AIState.TARGET_AQUISITION) {
            this.target = collision.other.gameObject.transform;
            this.state = AIState.PERSUIT;
        }
    }
}