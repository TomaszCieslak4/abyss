import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
import { Weapon } from "./weapon.js";


export class Player extends Script {
    protected rigidBody!: RigidBody;
    weapon: Weapon | null = null;

    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody)!;
    }
}