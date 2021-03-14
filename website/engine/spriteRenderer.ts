import { Color } from "./color.js";
import { SceneManager } from "./sceneManager.js";
import { Script } from "./script.js";
import { Transform } from "./transform.js";

export class SpriteRenderer extends Script {
    sprite?: HTMLImageElement;
    transform!: Transform;

    start() {
        this.transform = this.gameObject.getComponent(Transform)!;
    }

    draw() {
        if (!this.sprite || !this.sprite.complete || this.sprite.naturalWidth === 0) {
            SceneManager.context.fillStyle = "magenta";
            SceneManager.context.fillRect(
                this.transform.position.x - this.transform.scale.x,
                this.transform.position.y - this.transform.scale.y,
                this.transform.scale.x,
                this.transform.scale.y
            );
            return;
        }

        SceneManager.context.drawImage(this.sprite,
            this.transform.position.x - this.transform.scale.x,
            this.transform.position.y - this.transform.scale.y,
            this.transform.scale.x,
            this.transform.scale.y
        );
    }
}