import { Script } from "./script.js";
export class Magazine extends Script {
    constructor() {
        super(...arguments);
        this.ammo = 50;
        this.capacity = 50;
    }
}
