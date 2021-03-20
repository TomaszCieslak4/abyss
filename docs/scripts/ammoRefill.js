import { Interactable } from "./interactable.js";
export class AmmoRefill extends Interactable {
    interact(player) {
        if (player.weapon && !this.used) {
            player.weapon.ammo = player.weapon.capacity;
            return super.interact(player);
        }
        return false;
    }
}
