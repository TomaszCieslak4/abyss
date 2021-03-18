import { Camera } from "./core/camera.js";
import { Input } from "./util/input.js";
import { SceneManager } from "./scene/sceneManager.js";
import { Time } from "./util/time.js";

let interval: number = 0;
let lastTime: number = 0;
let lastFixedUpdate: number = 0;

const update = (timestamp: number) => {
    Input.update();
    Time.deltaTime = (timestamp - lastTime) / 1000;
    let change = 0;
    while (timestamp - lastFixedUpdate - change >= Time.fixedDeltaTime * 1000 && change < 1000) {
        SceneManager.activeScene.fixedUpdate();
        change += Time.fixedDeltaTime * 1000;
    }
    lastFixedUpdate += change;
    SceneManager.activeScene.update();
    Camera.main?.beginDraw();
    lastTime = timestamp;
    interval = requestAnimationFrame(update);
};

$(() => {
    Input.init(["x", "y", "fire"], [
        { axis: "y", key: "w", value: 1 },
        { axis: "y", key: "s", value: -1 },
        { axis: "x", key: "a", value: -1 },
        { axis: "x", key: "d", value: 1 },
        { axis: "fire", key: "mouse0", value: 1 }
    ]);

    SceneManager.setScene(window.location.port === "25565" ? 2 : 0);

    lastTime = performance.now();
    lastFixedUpdate = lastTime;
    interval = requestAnimationFrame(update);
});

