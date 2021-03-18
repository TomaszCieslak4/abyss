import { Script } from "../script/script.js";
;
export class Collider extends Script {
    constructor() {
        super(...arguments);
        this.isTrigger = false;
        this.collisions = [];
    }
}
