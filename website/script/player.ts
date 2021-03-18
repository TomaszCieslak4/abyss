import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
import { Weapon } from "./weapon.js";
import { Vec2 } from "../util/vector.js";
import { Time } from "../util/time.js";
import { Camera } from "../core/camera.js";

export class Player extends Script {
    private rigidBody!: RigidBody;
    weapon: Weapon | null = null;

    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody)!;
    }

    update() {
        this.rigidBody.velocity = new Vec2(Input.getAxis("x") * 500, Input.getAxis("y") * 500);
        // this.gameObject.transform.rotation += Math.PI / 6 * Time.deltaTime;

        if (Input.getButton("fire")) {
            this.weapon?.shoot();
        }
    }
}