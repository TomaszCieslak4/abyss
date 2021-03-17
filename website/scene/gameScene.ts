import { Scene } from "./scene.js";
import { PlayerPrefab } from "../prefabs/playerPrefab.js";
import { GameObject } from "../core/gameObject.js";
import { Camera } from "../core/camera.js";
import { FollowCamera } from "../script/followCamera.js";

export class GameScene extends Scene {

    onLoad() {
        $(".container").addClass("nonclick");
        (document.querySelector("audio") as HTMLAudioElement).currentTime = 0;
        let elm = (document.querySelector("audio") as HTMLAudioElement);
        elm.currentTime = 64.15;
        elm.volume = 0.1;
        elm.loop = true;
        elm.play();

        let obj = this.instantiate(GameObject);
        obj.addComponent(Camera);
        let comp = obj.addComponent(FollowCamera);
        comp.player = this.instantiate(PlayerPrefab);
        obj.start();

        // new Wall(new Vec2(200, 200), new Vec2(1000, 10));
    }

    onUnLoad() {
        $(".container").removeClass("nonclick");
        (document.querySelector("audio") as HTMLAudioElement).pause();
    }
}