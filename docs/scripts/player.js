import { RigidBody } from "../engine/physics/rigidbody.js";
import { Script } from "../engine/core/script.js";
import { Health } from "./health.js";
import { GameManager } from "./gameManager.js";
import { SceneManager } from "../engine/core/sceneManager.js";
import { Vec2 } from "../engine/util/vector.js";
import { GroundDrop } from "./groundDrop.js";
import { GroundDropPrefab } from "../prefabs/groundDropPrefab.js";
import { Time } from "../engine/util/time.js";
export class Player extends Script {
    constructor() {
        super(...arguments);
        this.weapon = null;
        this.nearestGroundDrop = null;
        this.equipCooldown = 0.1;
        this.timeToEquip = 0.2;
        this._score = 0;
    }
    get score() { return this._score; }
    set score(value) { this._score = value; }
    update() {
        this.timeToEquip += Time.deltaTime;
    }
    start() {
        this.rigidBody = this.gameObject.getComponent(RigidBody);
        this.health = this.gameObject.getComponent(Health);
    }
    onNearGroundDrop(obj) {
        if (this.nearestGroundDrop) {
            if (obj.gameObject.transform.position.sqr_dist(this.gameObject.transform.position) <
                this.nearestGroundDrop.gameObject.transform.position.sqr_dist(this.gameObject.transform.position)) {
                this.nearestGroundDrop = obj;
            }
        }
        else {
            this.nearestGroundDrop = obj;
        }
    }
    onLeaveGroundDrop(obj) {
        if (obj === this.nearestGroundDrop) {
            this.nearestGroundDrop = null;
        }
    }
    equipWeapon(weapon) {
        if (this.timeToEquip < this.equipCooldown)
            return false;
        this.timeToEquip = 0;
        if (this.weapon) {
            this.weapon.gameObject.transform.parent = null;
            this.weapon.owner = null;
            let drop = this.gameObject.instantiate(GroundDropPrefab, this.gameObject.transform.position);
            drop.getComponent(GroundDrop).obj = this.weapon;
            drop.transform.setSiblingIndex(0);
        }
        this.weapon = weapon;
        weapon.owner = this;
        this.gameObject.transform.addChild(weapon.gameObject.transform);
        weapon.gameObject.transform.localPosition = new Vec2(1, 0.45);
        weapon.gameObject.transform.localRotation = -Math.PI / 12;
        return true;
    }
    onDestroy() {
        let manager = SceneManager.activeScene.findComponents(GameManager).next().value;
        manager.playerCount -= 1;
    }
}
