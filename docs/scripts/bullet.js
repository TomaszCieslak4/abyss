import { Vec2 } from "../engine/util/vector.js";
import { Script } from "../engine/core/script.js";
import { Health } from "./health.js";
export class Bullet extends Script {
    constructor() {
        super(...arguments);
        this.startPos = Vec2.zero();
        this.maxDistance = 10;
        this.damage = 1;
    }
    start() {
        this.startPos = this.gameObject.transform.position;
    }
    fixedUpdate() {
        if (this.gameObject.transform.position.sqr_dist(this.startPos) > this.maxDistance * this.maxDistance) {
            this.gameObject.destroy(this.gameObject);
        }
    }
    onTriggerEnter(collision) {
        var _a;
        if (collision.gameObject !== this.owner.gameObject)
            (_a = collision.gameObject.getComponent(Health)) === null || _a === void 0 ? void 0 : _a.takeDamage(this.damage, this.owner);
        this.gameObject.destroy(this.gameObject);
    }
}
