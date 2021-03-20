import { Script } from "../core/script.js";
export class Collider extends Script {
    constructor() {
        super(...arguments);
        this.isTrigger = false;
    }
}
