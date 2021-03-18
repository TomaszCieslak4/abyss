import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Weapon } from "./weapon.js";
import { Vec2 } from "../util/vector.js";
import { Camera } from "../core/camera.js";
import { Player } from "./player.js";

export class HumanPlayer extends Player {
    weapon: Weapon | null = null;
    ammoElm!: HTMLParagraphElement;

    start() {
        super.start();
        this.ammoElm = $("#ammo").get()[0] as HTMLParagraphElement;
        this.ammoElm.innerText = this.weapon?.magazine!.ammo.toString() ?? "?";
    }

    update() {
        this.rigidBody.velocity = new Vec2(Input.getAxis("x") * 10, -Input.getAxis("y") * 10);
        let direction = this.gameObject.transform.position.sub(Camera.main.viewportToWorld().mul_vec2(Input.mousePos)).mul_s(-1).normalize();
        this.gameObject.transform.forward = direction;

        if (Input.getButton("fire") && this.weapon) {
            // this.weapon.gameObject.transform.parent = null;
            // this.weapon = null;
            if (this.weapon.shoot()) {
                this.ammoElm.innerText = this.weapon.magazine!.ammo.toString();
            }
        }
    }
}