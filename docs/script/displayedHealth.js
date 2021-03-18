import { Health } from "./health.js";
export class DisplayedHealth extends Health {
    constructor() {
        super(...arguments);
        this._health = 100;
    }
    get health() { return this._health; }
    set health(value) {
        var _a;
        this._health = value;
        this.healthElm.innerText = value.toString();
        (_a = this.healthObj) === null || _a === void 0 ? void 0 : _a.setHealth(this.health, this.maxHealth);
    }
    start() {
        this.healthElm = $("#health").get()[0];
        this.health = this.health;
        super.start();
    }
}
