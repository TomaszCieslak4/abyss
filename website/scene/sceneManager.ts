import { GameScene } from "./gameScene.js";
import { LoginScene } from "./loginScene.js";
import { RegisterScene } from "./registerScene.js";
import { Scene } from "./scene.js";
import { Type } from "../util/util.js";

export class SceneManager {
    private static scenes: Type<Scene>[] = [LoginScene, RegisterScene, GameScene];
    static activeScene: Scene;

    static setScene(ind: number) {
        if (this.activeScene) this.activeScene.onUnLoad();
        this.activeScene = new SceneManager.scenes[ind]();
        this.activeScene.onLoad();
    }
}