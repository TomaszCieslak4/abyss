import { GameObject } from "../engine/core/gameObject.js";
import { Color } from "../engine/util/color.js";
import { Vec2 } from "../engine/util/vector.js";
import { CircleCollider } from "../engine/physics/circleCollider.js";
import { CircleRenderer } from "../engine/renderer/circleRenderer.js";
import { Crate } from "../scripts/crate.js";
import { HealthRenderer } from "../scripts/healthRenderer.js";
import { RectRenderer } from "../engine/renderer/rectRenderer.js";
import { BoxCollider } from "../engine/physics/boxCollider.js";
import { CrateRenderer } from "../scripts/crateRenderer.js";

export class CratePrefab extends GameObject {
    load() {
        let visual = this.instantiate(GameObject, new Vec2(0, 0), new Vec2(2, 2), null, this.transform);
        let renderer = visual.addComponent(RectRenderer);
        visual.addComponent(BoxCollider);
        renderer.color = new Color(255, 255, 255);
        this.addComponent(Crate).healthObj = visual.addComponent(CrateRenderer);
        this.transform.rotation = -Math.PI / 2;
    }
}