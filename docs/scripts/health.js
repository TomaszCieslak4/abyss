import { NumberTween } from "../engine/util/numberTween.js";
import { Script } from "../engine/core/script.js";
import { DeathAnimator } from "./deathAnimator.js";
export class Health extends Script {
    constructor() {
        super(...arguments);
        this._health = new NumberTween(0.25, 100);
        this._maxHealth = new NumberTween(0.25, 100);
        this.isDead = false;
        this.deathScore = 10;
    }
    get maxHealth() { return this._maxHealth.immediate; }
    get health() { return this._health.immediate; }
    set health(value) { this._health.value = value; }
    update() {
        this._health.update();
        this._maxHealth.update();
        this.healthObj.setHealth(this._health.value / this._maxHealth.value);
    }
    takeDamage(amount, player) {
        this.health = this._health.immediate - Math.min(amount, this._health.immediate);
        if (this._health.immediate === 0) {
            if (player)
                player.score += this.deathScore;
            this.onDeath();
        }
    }
    onDeath() {
        if (!this.isDead) {
            this.isDead = true;
            this.gameObject.addComponent(DeathAnimator);
        }
    }
}
