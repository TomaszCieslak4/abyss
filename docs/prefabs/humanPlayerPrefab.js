import { HumanPlayer } from "../scripts/humanPlayer.js";
import { PlayerPrefab } from "./playerPrefab.js";
import { Health } from "../scripts/health.js";
import { HealthRenderer } from "../scripts/healthRenderer.js";
import { PlayerHealth } from "../scripts/playerHealth.js";
export class HumanPlayerPrefab extends PlayerPrefab {
    load() {
        super.load();
        this.destroyComponent(this.getComponent(Health));
        this.addComponent(PlayerHealth).healthObj = this.getComponentsInChildren(HealthRenderer).next().value;
        this.addComponent(HumanPlayer);
    }
}
