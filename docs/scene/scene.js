export class Scene {
    constructor() {
        this.gameObjects = [];
    }
    update(dt) {
        for (const obj of this.gameObjects) {
            obj.update(dt);
        }
    }
    onLoad() { }
    onUnLoad() { }
}
