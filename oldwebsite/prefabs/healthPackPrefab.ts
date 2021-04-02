import { GameObject } from "../engine/core/gameObject.js";
import { Color } from "../engine/util/color.js";
import { Vec2 } from "../engine/util/vector.js";
import { RectRenderer } from "../engine/renderer/rectRenderer.js";
import { HealthPack } from "../scripts/healthPack.js";
import { GroundDropPrefab } from "./groundDropPrefab.js";
import { GroundDrop } from "../scripts/groundDrop.js";

export class HealthPackPrefab extends GroundDropPrefab {
    load() {
        super.load();
        let visual = this.instantiate(GameObject);
        let vertical = this.instantiate(GameObject, null, new Vec2(0.2, 0.75), null, visual.transform);
        let verticalRenderer = vertical.addComponent(RectRenderer);
        verticalRenderer.color = new Color(255, 154, 198);

        let horizontal = this.instantiate(GameObject, null, new Vec2(0.75, 0.2), null, visual.transform);
        let horizontalRenderer = horizontal.addComponent(RectRenderer);
        horizontalRenderer.color = new Color(255, 154, 198);
        this.getComponent(GroundDrop)!.obj = visual.addComponent(HealthPack);
    }
}