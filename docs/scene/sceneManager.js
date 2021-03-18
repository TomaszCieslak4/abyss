import { GameScene } from "./gameScene.js";
import { LoginScene } from "./loginScene.js";
import { RegisterScene } from "./registerScene.js";
import { MainMenuScene } from "./mainMenu.js";
import { ProfileScene } from "./profileScene.js";
import { LoggedUser } from "../loggedUser.js";
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
SceneManager.user = new LoggedUser();
