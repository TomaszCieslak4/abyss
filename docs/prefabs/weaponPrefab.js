import { GameObject } from "../core/gameObject.js";
import { BoxCollider } from "../physics/boxCollider.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
import { Weapon } from "../script/weapon.js";
import { Vec2 } from "../util/vector.js";
export class WeaponPrefab extends GameObject {
    constructor() {
        super();
        this.addComponent(SpriteRenderer);
        this.addComponent(BoxCollider);
        this.transform.scale = new Vec2(0.1, 3);
        let weapon = this.addComponent(Weapon);
        weapon.spawnpoint = this.instantiate(GameObject, new Vec2(0, 0.5), null, null, this.transform);
    }
}
