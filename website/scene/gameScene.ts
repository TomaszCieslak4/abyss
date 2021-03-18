import { Scene } from "./scene.js";
import { PlayerPrefab } from "../prefabs/playerPrefab.js";
import { GameObject } from "../core/gameObject.js";
import { Camera } from "../core/camera.js";
import { FollowCamera } from "../script/followCamera.js";
import { Vec2 } from "../util/vector.js";

export class GameScene extends Scene {

    onLoad() {
        $("#ui_game").show();
        $(".container").addClass("nonclick");
        $(".container").attr("oncontextmenu", "return false");
        (document.querySelector("audio") as HTMLAudioElement).currentTime = 0;
        let elm = (document.querySelector("audio") as HTMLAudioElement);
        elm.currentTime = 64.15;
        elm.volume = 0.1;
        elm.loop = true;
        elm.play();

        let cam = this.instantiate(GameObject);
        cam.addComponent(Camera);
        let comp = cam.addComponent(FollowCamera);
        cam.transform.position = new Vec2(0, 0)
        cam.transform.scale = new Vec2(1000, 1000);

        comp.player = this.instantiate(PlayerPrefab);
        comp.player.transform.scale = new Vec2(100, 100);
        comp.player.transform.position = new Vec2(200, 200);
        comp.player.start();

        console.log(cam.transform.scale);
        cam.start();

        // new Wall(new Vec2(200, 200), new Vec2(1000, 10));
    }

    onUnLoad() {
        $(".container").removeClass("nonclick");
        $(".container").removeAttr("oncontextmenu");
        (document.querySelector("audio") as HTMLAudioElement).pause();
    }
}