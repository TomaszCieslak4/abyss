import { GameObject } from "../engine/core/gameObject.js";
import { Color } from "../engine/util/color.js";
import { Vec2 } from "../engine/util/vector.js";
import { BoxCollider } from "../engine/physics/boxCollider.js";
import { RectRenderer } from "../engine/renderer/rectRenderer.js";
export class WallPrefab extends GameObject {
    load() {
        let visual = this.instantiate(GameObject, new Vec2(0, 0), new Vec2(4, 4), null, this.transform);
        let renderer = visual.addComponent(RectRenderer);
        visual.addComponent(BoxCollider);
        renderer.color = new Color(255, 255, 255);
    }
}
