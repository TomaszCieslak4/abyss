import { Vec2 } from "../util/vector.js";
import { Script } from "./script.js";
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
    update() {
        if (this.gameObject.transform.position.sqr_dist(this.startPos) > this.maxDistance * this.maxDistance) {
            this.gameObject.destroy(this.gameObject);
        }
    }
    fixedUpdate() {
        // this.rigidBody.velocity = Vec2.lerp(this.rigidBody.velocity, this.gameObject.transform.position.sub(Camera.main.viewportToWorld().mul_vec2(Input.mousePos)).normalize().mul_s(-10), 0.2);
    }
    onCollisionEnter(collision) {
        var _a;
        (_a = collision.other.gameObject.transform.root.gameObject.getComponent(Health)) === null || _a === void 0 ? void 0 : _a.takeDamage(this.damage);
        this.gameObject.destroy(this.gameObject);
    }
}
