

import { Input } from "../util/input.js";
import { RigidBody } from "../physics/rigidbody.js";
import { Script } from "./script.js";
import { Weapon } from "./weapon.js";
import { WeaponPrefab } from "../prefabs/weaponPrefab.js";
import { GameObject } from "../core/gameObject.js";
import { Vec2 } from "../util/vector.js";

export class FollowCamera extends Script {
    public player!: GameObject;

    update() {
        this.gameObject.transform.position = Vec2.lerp(this.gameObject.transform.position,
            this.player.transform.position.sub(this.gameObject.transform.scale.div_s(2)).add(this.player.transform.scale.div_s(2)), 0.02);
    }
}