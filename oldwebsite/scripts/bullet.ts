import { Vec2 } from "../engine/util/vector.js";
import { Collision, RigidBody } from "../engine/physics/rigidbody.js";
import { Script } from "../engine/core/script.js";
import { GameObject } from "../engine/core/gameObject.js";
import { Health } from "./health.js";
import { Player } from "./player.js";

export class Bullet extends Script {
    private rigidBody!: RigidBody;
    private startPos: Vec2 = Vec2.zero();
    public maxDistance: number = 10;
    public spawnpoint!: GameObject;
    public damage: number = 1;
    public owner!: Player;

    start() {
        this.startPos = this.gameObject.transform.position;
    }

    fixedUpdate() {
        if (this.gameObject.transform.position.sqr_dist(this.startPos) > this.maxDistance * this.maxDistance) {
            this.gameObject.destroy(this.gameObject);
        }
    }

    onTriggerEnter(collision: Collision) {
        if (collision.gameObject !== this.owner.gameObject)
            collision.gameObject.getComponent(Health)?.takeDamage(this.damage, this.owner);
        this.gameObject.destroy(this.gameObject);
    }
}