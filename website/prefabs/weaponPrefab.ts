import { GameObject } from "../core/gameObject.js";
import { BoxCollider } from "../physics/boxCollider.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
import { Magazine } from "../script/magazine.js";
import { Weapon } from "../script/weapon.js";
import { Vec2 } from "../util/vector.js";
import { MagazinePrefab } from "./magazinePrefab.js";

export class WeaponPrefab extends GameObject {
    constructor() {
        super();
        let visual = this.instantiate(GameObject, new Vec2(0, 0), new Vec2(1, 0.1), null, this.transform);
        visual.addComponent(SpriteRenderer);

        let weapon = this.addComponent(Weapon);
        weapon.spawnpoint = this.instantiate(GameObject, new Vec2(1, 0), null, null, this.transform);

        let mag = this.instantiate(MagazinePrefab, new Vec2(-0.1, 2), null, Math.PI / 2, this.transform);
        weapon.magazine = mag.getComponent(Magazine);
    }
}