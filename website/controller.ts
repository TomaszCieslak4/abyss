import { Camera } from "./camera.js";
import { Input } from "./input.js";
import { SceneManager } from "./scene/sceneManager.js";

let interval: number = 0;
let lastTime: number = 0;
let lastFixedUpdate: number = 0;

const update = (timestamp: number) => {
    Input.update();
    SceneManager.activeScene.update((timestamp - lastTime) / 1000);
    Camera.main.draw();
    lastTime = timestamp;
    interval = requestAnimationFrame(update);
};

$(() => {
    Input.init(["x", "y", "fire"], [
        { axis: "y", key: "w", value: 1 },
        { axis: "y", key: "s", value: -1 },
        { axis: "x", key: "a", value: 1 },
        { axis: "x", key: "d", value: -1 },
        { axis: "fire", key: "mouse0", value: 1 }
    ]);

    SceneManager.setScene(0);

    lastTime = performance.now();
    lastFixedUpdate = lastTime;
    interval = requestAnimationFrame(update);
});

