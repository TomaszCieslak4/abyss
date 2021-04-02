import { GameObject } from "../engine/core/gameObject.js";
import { Script } from "../engine/core/script.js";
import { Collider } from "../engine/physics/collider.js";
import { Collision } from "../engine/physics/rigidbody.js";
import { Time } from "../engine/util/time.js";
import { Vec2 } from "../engine/util/vector.js";
import { DeathAnimator } from "./deathAnimator.js";
import { Interactable } from "./interactable.js";
import { Player } from "./player.js";

export class GroundDrop extends Script {
    private _obj: Interactable | null = null;
    public get obj(): Interactable | null {
        return this._obj;
    }
    public set obj(value: Interactable | null) {
        if (this._obj) this._obj.gameObject.transform.parent = null;
        if (value) {
            this.gameObject.transform.addChild(value.gameObject.transform);
            value.gameObject.transform.localPosition = new Vec2(0, 0);
        }
        this._obj = value;
    }

    progress: number = 0;
    sizeSpeed: number = 2;

    ring1!: GameObject;
    ring2!: GameObject;
    ring3!: GameObject;

    interact(player: Player): boolean {
        if (this.obj && this.obj.interact(player)) {
            this.gameObject.addComponent(DeathAnimator);
            return true;
        }
        return false;
    }

    onTriggerStay(collision: Collision) {
        collision.gameObject.getComponent(Player)?.onNearGroundDrop(this);
    }

    onTriggerExit(collider: Collider, gameObject: GameObject) {
        gameObject.getComponent(Player)?.onLeaveGroundDrop(this);
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