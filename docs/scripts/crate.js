import { Health } from "./health.js";
import { ARPrefab } from "../prefabs/weapons/arPrefab.js";
import { SmgPrefab } from "../prefabs/weapons/smgPrefab.js";
import { SniperPrefab } from "../prefabs/weapons/sniperPrefab.js";
import { GroundDropPrefab } from "../prefabs/groundDropPrefab.js";
import { GroundDrop } from "./groundDrop.js";
import { Interactable } from "./interactable.js";
export class Crate extends Health {
    constructor() {
        super(...arguments);
        this.lootPool = [ARPrefab, SmgPrefab, SniperPrefab];
    }
    onDestroy() {
        let obj = this.gameObject.instantiate(this.lootPool[Math.round(Math.random() * (this.lootPool.length - 1))]);
        let drop = this.gameObject.instantiate(GroundDropPrefab, this.gameObject.transform.position);
        drop.getComponent(GroundDrop).obj = obj.getComponent(Interactable);
        drop.transform.setSiblingIndex(0);
    }
}
