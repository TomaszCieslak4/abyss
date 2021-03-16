import { GameScene } from "./gameScene.js";
import { LoginScene } from "./loginScene.js";
import { RegisterScene } from "./registerScene.js";
export class SceneManager {
    static setScene(ind) {
        if (this.activeScene)
            this.activeScene.onUnLoad();
        this.activeScene = new SceneManager.scenes[ind]();
        this.activeScene.onLoad();
    }
}
SceneManager.scenes = [LoginScene, RegisterScene, GameScene];
