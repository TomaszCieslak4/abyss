import { Time } from "../engine/util/time.js";
import { Interactable } from "./interactable.js";
import { Player } from "./player.js";

export class AmmoRefill extends Interactable {

    interact(player: Player) {
        if (player.weapon && !this.used) {
            player.weapon.ammo = player.weapon.capacity;
            return super.interact(player);
        }
        return false;
    }
}