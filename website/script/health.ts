import { GameObject } from "../core/gameObject.js";
import { CircleRenderer } from "../renderer/circleRenderer.js";
import { HealthRenderer } from "../renderer/healthRenderer.js";
import { Color } from "../util/color.js";
import { Vec2 } from "../util/vector.js";
import { Script } from "./script.js";

export class Health extends Script {
    maxHealth: number = 100;
    protected _health: number = 100;
    public get health(): number { return this._health; }
    public set health(value: number) {
        this._health = value;
        this.healthObj.setHealth(this.health, this.maxHealth);
    }
    healthObj!: HealthRenderer;

    start() {
        this.healthObj = this.gameObject.addComponent(HealthRenderer);
        // let obj = this.gameObject.instantiate(GameObject);
        // this.healthObj = obj.addComponent(CircleRenderer);
        // this.health = this.health;
        // this.healthObj.color = new Color(255, 0, 0);
        // this.gameObject.transform.addChild(obj.transform, 0);
        // obj.transform.localPosition = new Vec2(0, 0);
        // obj.transform.scale = new Vec2(2.5, 2.5);
    }

    takeDamage(amount: number) {
        this.health -= Math.min(amount, this.health);
        if (this.health === 0) {
            this.onDeath();
        }
    }

    onDeath() {
        this.gameObject.destroy(this.gameObject);
    }
}