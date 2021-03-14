export class SceneManager {
    static setCanvas(canvas) {
        SceneManager.canvas = canvas;
        SceneManager.width = canvas.width;
        SceneManager.height = canvas.height;
        SceneManager.context = this.canvas.getContext('2d');
    }
    static init(scenes) {
        SceneManager.scenes = scenes;
    }
    static setScene(ind) {
        this.activeScene = new SceneManager.scenes[ind]();
    }
}
SceneManager.scenes = [];
