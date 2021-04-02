import { GameScene } from "../../scene/gameScene.js";
import { LoginScene } from "../../scene/loginScene.js";
import { RegisterScene } from "../../scene/registerScene.js";
import { Scene } from "./scene.js";
import { Type } from "../util/util.js";
import { MainMenuScene } from "../../scene/mainMenu.js";
import { ProfileScene } from "../../scene/profileScene.js";

export class SceneManager {
    private static scenes: Type<Scene>[] = [LoginScene, RegisterScene, MainMenuScene, ProfileScene, GameScene];
    private static _activeScene: Scene;
    public static get activeScene(): Scene { return SceneManager._activeScene; }

    static setScene(ind: number) {
        if (this.activeScene) this.activeScene.onUnLoad();
        this._activeScene = new SceneManager.scenes[ind]();
        this.activeScene.onLoad();
    }
}