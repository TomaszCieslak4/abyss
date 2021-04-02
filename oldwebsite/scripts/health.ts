import { HealthRenderer } from "./healthRenderer.js";
import { NumberTween } from "../engine/util/numberTween.js";
import { Script } from "../engine/core/script.js";
import { DeathAnimator } from "./deathAnimator.js";
import { Player } from "./player.js";

export class Health extends Script {
    protected _health: NumberTween = new NumberTween(0.25, 100);
    protected _maxHealth: NumberTween = new NumberTween(0.25, 100);
    public get maxHealth(): number { return this._maxHealth.immediate; }
    public get health(): number { return this._health.immediate; }
    public set health(value: number) { this._health.value = value; }
    healthObj!: HealthRenderer;
    isDead: boolean = false;
    deathScore: number = 10;

    update() {
        this._health.update();
        this._maxHealth.update();
        this.healthObj.setHealth(this._health.value / this._maxHealth.value);
    }

    takeDamage(amount: number, player: Player | null) {
        this.health = this._health.immediate - Math.min(amount, this._health.immediate);
        if (this._health.immediate === 0) {
            if (player) player.score += this.deathScore;
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