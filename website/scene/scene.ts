import { GameObject } from "../gameObject";

export class Scene {
    gameObjects: GameObject[] = [];

    update(dt: number) {
        for (const obj of this.gameObjects) {
            obj.update(dt);
        }
    }

    onLoad() { }
    onUnLoad() { }
}



