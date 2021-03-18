import { Vec2 } from "../util/vector.js";
import { Player } from "./player.js";
var AIState;
(function (AIState) {
    AIState[AIState["TARGET_AQUISITION"] = 0] = "TARGET_AQUISITION";
    AIState[AIState["PERSUIT"] = 1] = "PERSUIT";
    AIState[AIState["AMMO_AQUISITION"] = 2] = "AMMO_AQUISITION";
})(AIState || (AIState = {}));
export class AIPlayer extends Player {
    constructor() {
        super(...arguments);
        this.target = null;
        this.state = AIState.TARGET_AQUISITION;
        this.persuitRange = 25;
        this.watchRange = 5;
    }
    fixedUpdate() {
        if (!this.target || this.state !== AIState.PERSUIT)
            return;
        let targetDistance = this.target.position.sqr_dist(this.gameObject.transform.position);
        if (targetDistance > this.persuitRange * this.persuitRange) {
            this.state = AIState.TARGET_AQUISITION;
            this.target = null;
            this.rigidBody.velocity = Vec2.zero();
            return;
        }
        if (targetDistance < this.watchRange * this.watchRange) {
            this.rigidBody.velocity = Vec2.zero();
        }
        else {
            this.rigidBody.velocity = this.gameObject.transform.forward.mul_s(5);
        }
        let direction = this.target.position.sub(this.gameObject.transform.position).normalize();
        this.gameObject.transform.forward = direction.sub(this.gameObject.transform.forward).mul_s(0.05).add(this.gameObject.transform.forward);
        if (this.weapon &&
            targetDistance < this.weapon.getRange() * this.weapon.getRange() * 0.8 &&
            this.gameObject.transform.forward.sqr_dist(direction) < 0.3)
            this.weapon.shoot();
    }
    onTriggerEnter(collision) {
        if (collision.other.gameObject.transform.root.gameObject.tag === "Player" && this.state === AIState.TARGET_AQUISITION) {
            this.target = collision.other.gameObject.transform;
            this.state = AIState.PERSUIT;
        }
    }
}
