import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
import { Weapon } from "./weapon.js";
import { WeaponPrefab } from "../prefabs/weaponPrefab.js";

export class Player extends Script {
    private rigidBody!: RigidBody;
    weapon: Weapon | null = null;

    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody)!;
    }

    update() {
        this.rigidBody.velocity.set_s(Input.getAxis("x") * -500, Input.getAxis("y") * -500);

        if (Input.getButton("fire")) {
            this.weapon?.shoot();
        }
    }
}