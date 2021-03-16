import { Scene } from "./scene.js";
import { Player } from "../player.js";

export class GameScene extends Scene {

    onLoad() {
        new Player();
    }
}