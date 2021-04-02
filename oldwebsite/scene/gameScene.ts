import { Scene } from "../engine/core/scene.js";
import { HumanPlayerPrefab } from "../prefabs/humanPlayerPrefab.js";
import { GameObject } from "../engine/core/gameObject.js";
import { Camera } from "../engine/core/camera.js";
import { FollowCamera } from "../scripts/followCamera.js";
import { Vec2 } from "../engine/util/vector.js";
import { BoxCollider } from "../engine/physics/boxCollider.js";
import { AmmoRefillPrefab } from "../prefabs/ammoRefillPrefab.js";
import { RectRenderer } from "../engine/renderer/rectRenderer.js";
import { Color } from "../engine/util/color.js";
import { WallRenderer } from "../scripts/wallRenderer.js";
import { CratePrefab } from "../prefabs/cratePrefab.js";
import { WallPrefab } from "../prefabs/wallPrefab.js";
import { lerp } from "../engine/util/util.js";
import { GameManager } from "../scripts/gameManager.js";
import { AIPlayerPrefab } from "../prefabs/aiPlayerPrefab.js";
import { HealthPackPrefab } from "../prefabs/healthPackPrefab.js";
import { LoggedUser } from "../loggedUser.js";
import { Player } from "../scripts/player.js";
import { AIPlayer } from "../scripts/aiPlayer.js";
import { SmgPrefab } from "../prefabs/weapons/smgPrefab.js";
import { Weapon } from "../scripts/weapon.js";
import { HumanPlayer } from "../scripts/humanPlayer.js";

export class GameScene extends Scene {

    onLoad() {
        $("#ui_game").show();
        $(".container").addClass("nonclick");
        $(".container").attr("oncontextmenu", "return false");

        let difficulty = LoggedUser.getDifficulty();
        let numItemPrefab = 0;
        let numAIPrefab = 0;
        let persuitRange = 0;
        let watchRange = 0;

        // Change opitions depending on difficulty
        if (difficulty == "easy") {
            numItemPrefab = 10;
            numAIPrefab = 5;
            persuitRange = 15;
            watchRange = 5;
        }
        else if (difficulty == "medium") {
            numItemPrefab = 15;
            numAIPrefab = 10;
            persuitRange = 20;
            watchRange = 5;
        }
        else { // hard
            numItemPrefab = 25;
            numAIPrefab = 15;
            persuitRange = 30;
            watchRange = 5;
        }

        // Audio
        (document.querySelector("audio") as HTMLAudioElement).currentTime = 0;
        const elm = (document.querySelector("audio") as HTMLAudioElement);
        elm.currentTime = 64.15;
        elm.volume = 0.1;
        elm.loop = true;
        elm.play();

        const gameManager = this.instantiate(GameObject).addComponent(GameManager);

        // Camera
        const cam = this.instantiate(GameObject, new Vec2(0, 0), new Vec2(30, 30));
        const followCamera = cam.addComponent(FollowCamera);
        cam.addComponent(Camera);

        const playRadius = 50;
        const boundryRadius = 20;
        const total = boundryRadius + playRadius;

        // Create Boundries
        const topBoundry = this.instantiate(GameObject, new Vec2(0, total), new Vec2(2 * total + 2 * boundryRadius, 2 * boundryRadius));
        const bottomBoundry = this.instantiate(GameObject, new Vec2(0, -total), new Vec2(2 * total + 2 * boundryRadius, 2 * boundryRadius));
        const leftBoundry = this.instantiate(GameObject, new Vec2(-total, 0), new Vec2(2 * boundryRadius, 2 * total + 2 * boundryRadius));
        const rightBoundry = this.instantiate(GameObject, new Vec2(total, 0), new Vec2(2 * boundryRadius, 2 * total + 2 * boundryRadius));

        // Boundry Renderers
        const boundryColor = new Color(16, 14, 23);
        topBoundry.addComponent(RectRenderer).color = boundryColor;
        bottomBoundry.addComponent(RectRenderer).color = boundryColor;
        leftBoundry.addComponent(RectRenderer).color = boundryColor;
        rightBoundry.addComponent(RectRenderer).color = boundryColor;

        // Boundry hitboxes
        topBoundry.addComponent(BoxCollider);
        bottomBoundry.addComponent(BoxCollider);
        leftBoundry.addComponent(BoxCollider);
        rightBoundry.addComponent(BoxCollider);

        // Create Border Walls
        const topWall = this.instantiate(GameObject, new Vec2(0.5, playRadius + 0.5), new Vec2(2 * playRadius + 1, 1), null);
        const bottomWall = this.instantiate(GameObject, new Vec2(-0.5, -playRadius - 0.5), new Vec2(2 * playRadius + 1, 1), null);
        const leftWall = this.instantiate(GameObject, new Vec2(-playRadius - 0.5, 0.5), new Vec2(1, 2 * playRadius + 1), null);
        const rightWall = this.instantiate(GameObject, new Vec2(playRadius + 0.5, -0.5), new Vec2(1, 2 * playRadius + 1), null);

        // Add renderers
        const topRenderer = topWall.addComponent(WallRenderer);
        const bottomRenderer = bottomWall.addComponent(WallRenderer);
        const leftRenderer = leftWall.addComponent(WallRenderer);
        const rightRenderer = rightWall.addComponent(WallRenderer);

        // Setup renderer values
        topRenderer.playRadius = playRadius;
        bottomRenderer.playRadius = playRadius;
        leftRenderer.playRadius = playRadius;
        rightRenderer.playRadius = playRadius;
        topRenderer.wall = 0;
        bottomRenderer.wall = 1;
        leftRenderer.wall = 2;
        rightRenderer.wall = 3;

        // Powerups
        this.instantiate(AmmoRefillPrefab, new Vec2(20, 15));

        const minDist = 10;
        let spawned = 0;
        for (let i = 0; i < 10000 && spawned < numItemPrefab; i++) {
            let pos = new Vec2(
                lerp(minDist - playRadius, playRadius - minDist, Math.random()),
                lerp(minDist - playRadius, playRadius - minDist, Math.random())
            );

            let safe = true;
            for (const obj of this.gameObjects) {
                if (obj.transform.position.sqr_dist(pos) < minDist * minDist) {
                    safe = false;
                    break;
                }
            }
            if (!safe) continue;

            let num = Math.round(Math.random() * 10);
            switch (num) {
                case 0:
                case 1:
                case 2:
                    this.instantiate(AmmoRefillPrefab, pos);
                    break;
                case 3:
                case 4:
                case 5:
                    this.instantiate(CratePrefab, pos);
                    break;
                case 6:
                case 7:
                    this.instantiate(HealthPackPrefab, pos);
                    break;
                case 8:
                case 9:
                case 10:
                    this.instantiate(WallPrefab, pos);
                    break;

                default:
                    break;
            }
            spawned++;
        }

        // Players
        spawned = 0;
        for (let i = 0; i < 10000 && spawned < numAIPrefab; i++) {
            let pos = new Vec2(
                lerp(minDist - playRadius, playRadius - minDist, Math.random()),
                lerp(minDist - playRadius, playRadius - minDist, Math.random())
            );

            let safe = true;
            for (const obj of this.gameObjects) {
                if (obj.transform.position.sqr_dist(pos) < minDist * minDist) {
                    safe = false;
                    break;
                }
            }
            if (!safe) continue;

            let player = this.instantiate(AIPlayerPrefab, pos).getComponent(AIPlayer)!;
            player.watchRange = watchRange;
            player.persuitRange = persuitRange;

            let weapon = this.instantiate(SmgPrefab, new Vec2(1, 0.45), null, -Math.PI / 12);
            player.equipWeapon(weapon.getComponent(Weapon)!);

            spawned += 1;
        }

        gameManager.playerCount = spawned;

        followCamera.player = this.instantiate(HumanPlayerPrefab, new Vec2(0, 0), null, 0);
        let weapon = this.instantiate(SmgPrefab, new Vec2(1, 0.45), null, -Math.PI / 12);
        followCamera.player.getComponent(HumanPlayer)!.equipWeapon(weapon.getComponent(Weapon)!);
    }

    onUnLoad() {
        $(".container").removeClass("nonclick");
        $(".container").removeAttr("oncontextmenu");
        $("#ui_game").hide();
        (document.querySelector("audio") as HTMLAudioElement).pause();
    }
}