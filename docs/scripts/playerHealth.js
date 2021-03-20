import { Health } from "./health.js";
export class PlayerHealth extends Health {
    set health(value) {
        this._health.value = value;
        this.healthElm.textContent = value.toString();
    }
    get health() { return this._health.immediate; }
    start() {
        this.healthElm = $("#health").get()[0];
        this.health = this.health;
        super.start();
    }
}
