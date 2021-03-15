import { Scene } from "./engine/scene.js";
import { Vec2 } from "./engine/vector.js";
import { RigidBody, RigidBodySystem } from "./engine/rigidbody.js";
import { Color } from "./engine/color.js";
import { EntityManager } from "./engine/ecs/entity.js";
import { Transform } from "./engine/transform.js";
import { Sprite, SpriteRendererSystem } from "./engine/spriteRenderer.js";
import { ColorData, ColorRendererSystem } from "./engine/colorRenderer.js";
import { RectCollider } from "./engine/rectCollider.js";
import { Player, PlayerSystem } from "./player.js";

function randint(n: number) { return Math.round(Math.random() * n); }
function rand(n: number) { return Math.random() * n; }

export class GameScene extends Scene {
    constructor() {
        super();
        EntityManager.registerComponentSystem(new SpriteRendererSystem());
        EntityManager.registerComponentSystem(new RigidBodySystem());
        EntityManager.registerComponentSystem(new ColorRendererSystem());
        EntityManager.registerComponentSystem(new PlayerSystem());

        // Add the player to the center of the stage
        let player = EntityManager.createEntity();
        EntityManager.addComponent(player, Transform);
        EntityManager.addComponent(player, RigidBody);
        EntityManager.addComponent(player, RectCollider);
        EntityManager.addComponent(player, Sprite);
        EntityManager.addComponent(player, Player);
        EntityManager.setComponentData(player, new Transform(new Vec2(200, 200), 0, new Vec2(50, 50)));
        EntityManager.setComponentData(player, new Player(1000));
        EntityManager.setComponentData(player, new RigidBody(Vec2.zero(), 0));

        // Add in some Balls
        let total = 4;
        while (total > 0) {
            let x = Math.floor((Math.random() * 1000));
            let y = Math.floor((Math.random() * 1000));

            let bullet = EntityManager.createEntity();
            EntityManager.addComponent(bullet, Transform);
            // EntityManager.addComponent(bullet, RigidBody);
            EntityManager.addComponent(bullet, ColorData);
            EntityManager.addComponent(bullet, RectCollider);
            EntityManager.setComponentData(bullet, new Transform(new Vec2(x, y), 0, new Vec2(20, 20)));
            // EntityManager.setComponentData(bullet, new RigidBody(new Vec2(rand(20), rand(20)).mul_s(10)));
            EntityManager.setComponentData(bullet, new ColorData(new Color(randint(255), randint(255), randint(255), Math.random())));
            total--;
        }
    }
}