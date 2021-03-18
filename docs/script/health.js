import { HealthRenderer } from "../renderer/healthRenderer.js";
import { Script } from "./script.js";
export class Health extends Script {
    constructor() {
        super(...arguments);
        this.maxHealth = 100;
        this._health = 100;
    }
    get health() { return this._health; }
    set health(value) {
        this._health = value;
        this.healthObj.setHealth(this.health, this.maxHealth);
    }
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
    takeDamage(amount) {
        this.health -= Math.min(amount, this.health);
        if (this.health === 0) {
            this.onDeath();
        }
    }
    onDeath() {
        this.gameObject.destroy(this.gameObject);
    }
}
