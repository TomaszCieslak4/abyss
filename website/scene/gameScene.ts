import { Scene } from "./scene.js";
import { Player } from "../player.js";
import { Wall } from "../wall.js";
import { Vec2 } from "../util/vector.js";

export class GameScene extends Scene {

    onLoad() {
        new Player();

        new Wall(new Vec2(200, 200), new Vec2(1000, 10));
    }
}