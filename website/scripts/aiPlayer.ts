import { Collision } from "../engine/physics/rigidbody.js";
import { Vec2 } from "../engine/util/vector.js";;
import { Player } from "./player.js";
import { Transform } from "../engine/core/transform.js";
import { Health } from "./health.js";
import { timers } from "jquery";
import { Time } from "../engine/util/time.js";
import { clamp } from "../engine/util/util.js";

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
        if (targetDistance > this.persuitRange * this.persuitRange || this.target.gameObject.getComponent(Health)?.isDead) {
            this.state = AIState.TARGET_AQUISITION;
            this.target = null;
            this.rigidBody.velocity = Vec2.zero();
            if (this.weapon) this.weapon.gameObject.transform.localRotation = Math.PI / 12;
            return;
        }

        if (targetDistance < this.watchRange * this.watchRange) {
            this.rigidBody.velocity = Vec2.zero();
        } else {
            this.rigidBody.velocity = this.gameObject.transform.forward.mul_s(5);
        }

        let direction = this.target.position.sub(this.gameObject.transform.position).normalize();
        this.gameObject.transform.forward = direction.sub(this.gameObject.transform.forward).mul_s(10 * Time.fixedDeltaTime).add(this.gameObject.transform.forward);
        if (this.weapon) this.weapon.gameObject.transform.rotation = this.target.position.sub(this.weapon.gameObject.transform.position).get_angle();

        if (this.weapon &&
            targetDistance < this.weapon.getRange() * this.weapon.getRange() * 0.8 &&
            this.gameObject.transform.forward.sqr_dist(direction) < 0.3
        )
            this.weapon.shoot();
    }

    onTriggerStay(collision: Collision) {
        if (collision.gameObject.tag === "Player" && this.state === AIState.TARGET_AQUISITION) {
            this.target = collision.gameObject.transform;
            this.state = AIState.PERSUIT;
        }
    }
}