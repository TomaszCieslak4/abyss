import { Scene } from "./scene.js";
import { SceneManager } from "./sceneManager.js";
export class MainMenuScene extends Scene {
    onLoad() {
        $("#start").on('click', () => { SceneManager.setScene(4); });
        $("#update").on('click', () => { SceneManager.setScene(3); });
        $("#logout").on('click', () => {
            SceneManager.user.setUser('');
            SceneManager.setScene(0);
        });
        $("#ui_menu").show();
    }
    onUnLoad() {
        $("#start").off('click');
        $("#update").off('click');
        $("#logout").off('click');
        $("#ui_menu").hide();
    }
}
