import { Script } from "../engine/core/script.js";
import { Collider } from "../engine/physics/collider.js";
import { Time } from "../engine/util/time.js";
import { Vec2 } from "../engine/util/vector.js";

export class DeathAnimator extends Script {
    shrinkSpeed: number = 20;

    start() {
        for (const collider of this.gameObject.getComponentsInChildren(Collider)) {
            collider.enabled = false;
        }
    }

    update() {
        this.gameObject.transform.localScale = Vec2.lerp(this.gameObject.transform.localScale, Vec2.zero(), this.shrinkSpeed * Time.deltaTime);
        if (this.gameObject.transform.localScale.x <= 0.01) {
            this.gameObject.destroy(this.gameObject);
        }
    }
}