import { GameScene } from "./scenes/gameScene.js";
import { LoginScene } from "./scenes/loginScene.js";
import { RegisterScene } from "./scenes/registerScene.js";
export class SceneManager {
    static setScene(ind) {
        if (this.activeScene)
            this.activeScene.onUnLoad();
        this.activeScene = new SceneManager.scenes[ind]();
        this.activeScene.onLoad();
    }
}
SceneManager.scenes = [LoginScene, RegisterScene, GameScene];
