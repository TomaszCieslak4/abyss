import { Script } from "../engine/core/script.js";
import { Time } from "../engine/util/time.js";
import { Vec2 } from "../engine/util/vector.js";
import { DeathAnimator } from "./deathAnimator.js";
import { Player } from "./player.js";
export class GroundDrop extends Script {
    constructor() {
        super(...arguments);
        this._obj = null;
        this.progress = 0;
        this.sizeSpeed = 2;
    }
    get obj() {
        return this._obj;
    }
    set obj(value) {
        if (this._obj)
            this._obj.gameObject.transform.parent = null;
        if (value) {
            this.gameObject.transform.addChild(value.gameObject.transform);
            value.gameObject.transform.localPosition = new Vec2(0, 0);
        }
        this._obj = value;
    }
    interact(player) {
        if (this.obj && this.obj.interact(player)) {
            this.gameObject.addComponent(DeathAnimator);
            return true;
        }
        return false;
    }
    onTriggerStay(collision) {
        var _a;
        (_a = collision.gameObject.getComponent(Player)) === null || _a === void 0 ? void 0 : _a.onNearGroundDrop(this);
    }
    onTriggerExit(collider, gameObject) {
        var _a;
        (_a = gameObject.getComponent(Player)) === null || _a === void 0 ? void 0 : _a.onLeaveGroundDrop(this);
    }
    update() {
        super.update();
        this.progress += Time.deltaTime * this.sizeSpeed;
        let t = (Math.sin(this.progress) + 1) / 2;
        this.ring3.transform.localScale = Vec2.lerp(new Vec2(3.1, 3.1), new Vec2(3.2, 3.2), t);
        this.ring2.transform.localScale = Vec2.lerp(new Vec2(2.5, 2.5), new Vec2(2.3, 2.3), t);
        this.ring1.transform.localScale = Vec2.lerp(new Vec2(1.5, 1.5), new Vec2(1.7, 1.7), t);
    }
}
