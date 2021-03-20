import { GameObject } from "../../engine/core/gameObject.js";
import { RectRenderer } from "../../engine/renderer/rectRenderer.js";
import { Weapon } from "../../scripts/weapon.js";
import { Color } from "../../engine/util/color.js";
import { Vec2 } from "../../engine/util/vector.js";
export class SniperPrefab extends GameObject {
    load() {
        let visual = this.instantiate(GameObject, new Vec2(0, 0), new Vec2(0.5, 0.3), null, this.transform);
        let renderer = visual.addComponent(RectRenderer);
        renderer.color = new Color(255, 255, 255);
        visual = this.instantiate(GameObject, new Vec2(0.85, 0), new Vec2(0.15, 0.1), null, this.transform);
        renderer = visual.addComponent(RectRenderer);
        renderer.color = new Color(249, 156, 35);
        visual = this.instantiate(GameObject, new Vec2(0.45, 0), new Vec2(0.7, 0.15), null, this.transform);
        renderer = visual.addComponent(RectRenderer);
        renderer.color = new Color(255, 255, 255);
        let weapon = this.addComponent(Weapon);
        weapon.spawnpoint = this.instantiate(GameObject, new Vec2(1.2, 0), null, null, this.transform);
        weapon.damage = 40;
        weapon.reloadTime = 1;
        weapon.capacity = 10;
        weapon.range = 20;
    }
}
