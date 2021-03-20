import { Camera } from "./engine/core/camera.js";
import { Input } from "./engine/util/input.js";
import { SceneManager } from "./engine/core/sceneManager.js";
import { Time } from "./engine/util/time.js";
let interval = 0;
let lastTime = 0;
let lastFixedUpdate = 0;
const update = (timestamp) => {
    var _a;
    Input.update();
    if (timestamp - lastFixedUpdate > 200)
        lastTime = timestamp - 200;
    Time.deltaTime = (timestamp - lastTime) / 1000;
    while (timestamp - lastFixedUpdate >= Time.fixedDeltaTime * 1000) {
        SceneManager.activeScene.fixedUpdate();
        lastFixedUpdate += Time.fixedDeltaTime * 1000;
    }
    SceneManager.activeScene.update();
    (_a = Camera.main) === null || _a === void 0 ? void 0 : _a.beginDraw();
    lastTime = timestamp;
    interval = requestAnimationFrame(update);
};
$(() => {
    Input.init(["x+", "y+", "x-", "y-", "fire", "interact"], [
        { axis: "y+", key: "w", value: 1 },
        { axis: "y-", key: "s", value: -1 },
        { axis: "x-", key: "a", value: -1 },
        { axis: "x+", key: "d", value: 1 },
        { axis: "fire", key: "mouse0", value: 1 },
        { axis: "interact", key: "e", value: 1 }
    ]);
    SceneManager.setScene(window.location.port === "25565" ? 2 : 0);
    lastTime = performance.now();
    lastFixedUpdate = lastTime;
    interval = requestAnimationFrame(update);
});
