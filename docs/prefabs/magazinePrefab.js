import { GameObject } from "../core/gameObject.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
import { Magazine } from "../script/magazine.js";
import { Vec2 } from "../util/vector.js";
export class MagazinePrefab extends GameObject {
    constructor() {
        super();
        let visual = this.instantiate(GameObject, new Vec2(-1.8, 0), new Vec2(0.3, 0.1), null, this.transform);
        visual.addComponent(SpriteRenderer);
        this.addComponent(Magazine);
    }
}
