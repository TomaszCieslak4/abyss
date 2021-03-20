import { Color } from "../util/color.js";
import { Script } from "../core/script.js";
export class Renderer extends Script {
    constructor() {
        super(...arguments);
        this.color = new Color(0, 255, 0);
    }
    draw(context, cam) { }
}
