import { Scene } from "./scene.js";
import { PlayerPrefab } from "../prefabs/playerPrefab.js";
import { GameObject } from "../core/gameObject.js";
import { Camera } from "../core/camera.js";
import { FollowCamera } from "../script/followCamera.js";
import { Vec2 } from "../util/vector.js";
import { BoxCollider } from "../physics/boxCollider.js";
import { SpriteRenderer } from "../renderer/spriteRenderer.js";
export class GameScene extends Scene {
    onLoad() {
        $("#ui_game").show();
        $(".container").addClass("nonclick");
        $(".container").attr("oncontextmenu", "return false");
        document.querySelector("audio").currentTime = 0;
        let elm = document.querySelector("audio");
        elm.currentTime = 64.15;
        elm.volume = 0.1;
        elm.loop = true;
        elm.play();
        let cam = this.instantiate(GameObject);
        cam.addComponent(Camera);
        let comp = cam.addComponent(FollowCamera);
        cam.transform.position = new Vec2(0, 0);
        cam.transform.scale = new Vec2(30, 30);
        comp.player = this.instantiate(PlayerPrefab);
        let topWall = this.instantiate(GameObject, new Vec2(0, 20), new Vec2(41, 1));
        topWall.addComponent(BoxCollider);
        topWall.addComponent(SpriteRenderer);
        let bottomWall = this.instantiate(GameObject, new Vec2(0, -20), new Vec2(41, 1));
        bottomWall.addComponent(BoxCollider);
        bottomWall.addComponent(SpriteRenderer);
        let leftWall = this.instantiate(GameObject, new Vec2(-20, 0), new Vec2(1, 41));
        leftWall.addComponent(BoxCollider);
        leftWall.addComponent(SpriteRenderer);
        let rightWall = this.instantiate(GameObject, new Vec2(20, 0), new Vec2(1, 41));
        rightWall.addComponent(BoxCollider);
        rightWall.addComponent(SpriteRenderer);
    }
    onUnLoad() {
        $(".container").removeClass("nonclick");
        $(".container").removeAttr("oncontextmenu");
        document.querySelector("audio").pause();
    }
}
