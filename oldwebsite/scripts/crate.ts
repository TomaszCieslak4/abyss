import { GameObject } from "../engine/core/gameObject.js";
import { Health } from "./health.js";
import { Type } from "../engine/util/util.js";
import { ARPrefab } from "../prefabs/weapons/arPrefab.js";
import { SmgPrefab } from "../prefabs/weapons/smgPrefab.js";
import { SniperPrefab } from "../prefabs/weapons/sniperPrefab.js";
import { GroundDropPrefab } from "../prefabs/groundDropPrefab.js";
import { GroundDrop } from "./groundDrop.js";
import { Interactable } from "./interactable.js";

export class Crate extends Health {
    lootPool: Type<GameObject>[] = [ARPrefab, SmgPrefab, SniperPrefab];

    onDestroy() {
        let obj = this.gameObject.instantiate(this.lootPool[Math.round(Math.random() * (this.lootPool.length - 1))]);
        let drop = this.gameObject.instantiate(GroundDropPrefab, this.gameObject.transform.position);
        drop.getComponent(GroundDrop)!.obj = obj.getComponent(Interactable);
        drop.transform.setSiblingIndex(0);
    }
}