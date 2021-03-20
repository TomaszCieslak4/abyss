import { GameObject } from "../../engine/core/gameObject.js";
import { RectRenderer } from "../../engine/renderer/rectRenderer.js";
import { Weapon } from "../../scripts/weapon.js";
import { Color } from "../../engine/util/color.js";
import { Vec2 } from "../../engine/util/vector.js";
import { WeaponPrefab } from "../weaponPrefab.js";
export class ARPrefab extends WeaponPrefab {
    load() {
        super.load();
        let visual = this.instantiate(GameObject, new Vec2(0, 0), new Vec2(0.8, 0.3), null, this.transform);
        let renderer = visual.addComponent(RectRenderer);
        renderer.color = new Color(255, 255, 255);
        visual = this.instantiate(GameObject, new Vec2(0.45, 0), new Vec2(0.15, 0.2), null, this.transform);
        renderer = visual.addComponent(RectRenderer);
        renderer.color = new Color(249, 156, 35);
        let weapon = this.addComponent(Weapon);
        weapon.spawnpoint = this.instantiate(GameObject, new Vec2(0.7, 0), null, null, this.transform);
        weapon.damage = 20;
        weapon.reloadTime = 0.5;
        weapon.capacity = 50;
        weapon.range = 15;
    }
}
