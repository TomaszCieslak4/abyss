import { HumanPlayer } from "../scripts/humanPlayer.js";
import { Weapon } from "../scripts/weapon.js";
import { Vec2 } from "../engine/util/vector.js";
import { ARPrefab } from "./weapons/arPrefab.js";
import { PlayerPrefab } from "./playerPrefab.js";
import { Health } from "../scripts/health.js";
import { HealthRenderer } from "../scripts/healthRenderer.js";
import { PlayerHealth } from "../scripts/playerHealth.js";
import { SmgPrefab } from "./weapons/smgPrefab.js";

export class HumanPlayerPrefab extends PlayerPrefab {
    load() {
        super.load();
        this.destroyComponent(this.getComponent(Health)!);
        this.addComponent(PlayerHealth).healthObj = this.getComponentsInChildren(HealthRenderer).next().value;
        this.addComponent(HumanPlayer);
    }
}