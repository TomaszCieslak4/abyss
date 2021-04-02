import { Input } from "../engine/util/input.js";
import { Weapon } from "./weapon.js";
import { Vec2 } from "../engine/util/vector.js";
import { Camera } from "../engine/core/camera.js";
import { Player } from "./player.js";
import { SceneManager } from "../engine/core/sceneManager.js";
import { GameManager } from "./gameManager.js";
import { clamp } from "../engine/util/util.js";

export class HumanPlayer extends Player {
    weapon: Weapon | null = null;
    ammoElm!: HTMLParagraphElement;
    scoreElm!: HTMLParagraphElement;

    public get score(): number { return this._score; }
    public set score(value: number) { this._score = value; this.scoreElm.textContent = value.toString(); }

    start() {
        super.start();
        this.ammoElm = $("#ammo").get()[0] as HTMLParagraphElement;
        this.scoreElm = $("#score").get()[0] as HTMLParagraphElement;
        this.ammoElm.innerText = this.weapon ? this.weapon.ammo.toString() : "?";
        this.score = this.score;
    }

    update() {
        super.update();
        if (this.health.isDead) return;

        // Movement
        this.rigidBody.velocity = new Vec2((Input.getAxis("x-") + Input.getAxis("x+")) * 10, (Input.getAxis("y-") + Input.getAxis("y+")) * -10);
        let mousePos = Camera.main.viewportToWorld().mul_vec2(Input.mousePos);
        this.gameObject.transform.rotation = mousePos.sub(this.gameObject.transform.position).get_angle();
        if (this.weapon) {
            this.weapon.gameObject.transform.rotation = mousePos.sub(this.weapon.gameObject.transform.position).get_angle();
            this.weapon.gameObject.transform.localRotation = clamp(this.weapon.gameObject.transform.localRotation, Math.PI + 1.7, 2 * Math.PI);
        }

        // Interact
        if (Input.getButtonDown("interact") && this.nearestGroundDrop) {
            if (this.nearestGroundDrop.interact(this)) {
                this.nearestGroundDrop = null;
            }
        }

        // Weapon Fire
        if (Input.getButton("fire") && this.weapon) {
            this.weapon.shoot()
        }
    }

    ammoCountChanged() {
        if (this.ammoElm) this.ammoElm.innerText = this.weapon ? this.weapon.ammo.toString() : "?";
    }

    equipWeapon(weapon: Weapon) {
        if (!super.equipWeapon(weapon)) return false;
        this.ammoCountChanged();
        return true;
    }

    onDestroy() {
        let manager = SceneManager.activeScene.findComponents(GameManager).next().value as GameManager;
        manager.onGameLost(this);
    }
}