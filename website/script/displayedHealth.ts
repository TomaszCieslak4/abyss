import { Health } from "./health.js";

export class DisplayedHealth extends Health {
    protected _health: number = 100;
    public get health(): number { return this._health; }
    public set health(value: number) {
        this._health = value;
        this.healthElm.innerText = value.toString();
        this.healthObj?.setHealth(this.health, this.maxHealth);
    }
    healthElm!: HTMLParagraphElement;

    start() {
        this.healthElm = $("#health").get()[0] as HTMLParagraphElement;
        this.health = this.health;
        super.start();
    }
}