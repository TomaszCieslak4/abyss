import { Health } from "./health.js";

export class PlayerHealth extends Health {
    public set health(value: number) {
        this._health.value = value;
        this.healthElm.textContent = value.toString();
    }
    public get health(): number { return this._health.immediate; }
    healthElm!: HTMLParagraphElement;

    start() {
        this.healthElm = $("#health").get()[0] as HTMLParagraphElement;
        this.health = this.health;
        super.start();
    }
}