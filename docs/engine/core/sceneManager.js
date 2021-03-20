import { GameScene } from "../../scene/gameScene.js";
import { LoginScene } from "../../scene/loginScene.js";
import { RegisterScene } from "../../scene/registerScene.js";
import { MainMenuScene } from "../../scene/mainMenu.js";
import { ProfileScene } from "../../scene/profileScene.js";
export class SceneManager {
    static get activeScene() { return SceneManager._activeScene; }
    static setScene(ind) {
        if (this.activeScene)
            this.activeScene.onUnLoad();
        this._activeScene = new SceneManager.scenes[ind]();
        this.activeScene.onLoad();
    }
}
SceneManager.scenes = [LoginScene, RegisterScene, MainMenuScene, ProfileScene, GameScene];
