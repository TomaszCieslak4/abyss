import { Player } from "./player.js";
import { Scene } from "./engine/scene.js";
import { Vec2 } from "./engine/vector.js";
import { Bullet } from "./bullet.js";
import { RigidBody } from "./engine/rigidbody.js";
import { Color } from "./engine/color.js";
function randint(n) { return Math.round(Math.random() * n); }
function rand(n) { return Math.random() * n; }
export class GameScene extends Scene {
    constructor() {
        super();
        // let box = new OBB2D(new Vec2(0, 0), new Vec2(10, 10), 0);
        // let box2 = new OBB2D(new Vec2(10.1, 0), new Vec2(10, 10), 45);
        // console.log(box.overlaps(box2));
        // Add the player to the center of the stage
        this.player = this.instantiate(Player);
        this.player.transform.position = new Vec2(200, 200);
        this.player.transform.scale = new Vec2(50, 50);
        // Add in some Balls
        let total = 20;
        while (total > 0) {
            let x = Math.floor((Math.random() * 1000));
            let y = Math.floor((Math.random() * 1000));
            let bullet = this.instantiate(Bullet);
            bullet.transform.position = new Vec2(x, y);
            bullet.transform.scale = new Vec2(20, 20);
            bullet.getComponent(RigidBody).velocity = new Vec2(rand(20), rand(20)).mul_s(10);
            bullet.color = new Color(randint(255), randint(255), randint(255), Math.random());
            total--;
        }
        this.start();
    }
}
