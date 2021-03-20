import { Color } from "../util/color.js";
import { Script } from "../core/script.js";
import { Camera } from "../core/camera.js";

export class Renderer extends Script {
    color: Color = new Color(0, 255, 0);

    draw(context: CanvasRenderingContext2D, cam: Camera) { }
}