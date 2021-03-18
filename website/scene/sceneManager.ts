import { GameScene } from "./gameScene.js";
import { LoginScene } from "./loginScene.js";
import { RegisterScene } from "./registerScene.js";
import { Scene } from "./scene.js";
import { Type } from "../util/util.js";
import { MainMenuScene } from "./mainMenu.js";
import { ProfileScene } from "./profileScene.js";
import { LoggedUser } from "../loggedUser.js";

export class SceneManager {
    private static scenes: Type<Scene>[] = [LoginScene, RegisterScene, MainMenuScene, ProfileScene, GameScene];
    private static _activeScene: Scene;
    public static get activeScene(): Scene { return SceneManager._activeScene; }
    public static user: LoggedUser = new LoggedUser();

    static setScene(ind: number) {
        if (this.activeScene) this.activeScene.onUnLoad();
        this._activeScene = new SceneManager.scenes[ind]();
        this.activeScene.onLoad();
    }
}