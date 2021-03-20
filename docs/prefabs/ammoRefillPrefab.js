import { GameObject } from "../engine/core/gameObject.js";
import { TriangleRenderer } from "../engine/renderer/triangleRenderer.js";
import { AmmoRefill } from "../scripts/ammoRefill.js";
import { Color } from "../engine/util/color.js";
import { Vec2 } from "../engine/util/vector.js";
import { GroundDropPrefab } from "./groundDropPrefab.js";
import { GroundDrop } from "../scripts/groundDrop.js";
export class AmmoRefillPrefab extends GroundDropPrefab {
    load() {
        super.load();
        let triangle = this.instantiate(GameObject, null, new Vec2(0.75, 0.75), null, this.transform);
        let triangleRnderer = triangle.addComponent(TriangleRenderer);
        triangleRnderer.color = new Color(242, 249, 35);
        this.getComponent(GroundDrop).obj = triangle.addComponent(AmmoRefill);
    }
}
