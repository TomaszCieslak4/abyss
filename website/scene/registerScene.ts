import { Scene } from "./scene.js";
import { SceneManager } from "./sceneManager.js";

export class RegisterScene extends Scene {
    onLoad() {
        $("#loginPage").on('click', () => { SceneManager.setScene(0); });
        $("#ui_register").show();
    }

    onUnLoad() {
        $("#loginPage").off('click');
        $("#ui_register").hide();
    }
}