import { GameObject } from "../core/gameObject.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
import { Weapon } from "../script/weapon.js";
import { Vec2 } from "../util/vector.js";

export class WeaponPrefab extends GameObject {
    constructor() {
        super();
        this.addComponent(SpriteRenderer);
        this.addComponent(Weapon);
        this.start();
    }
}