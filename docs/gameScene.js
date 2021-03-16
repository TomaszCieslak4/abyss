import { EntityManager } from "./engine/ecs/entity.js";
import { Scene } from "./engine/scene.js";
import { Color } from "./engine/math/color.js";
import { Vec2 } from "./engine/math/vector.js";
// Components
import { Transform } from "./engine/ecs/components/transform.js";
import { RectCollider } from "./engine/ecs/components/rectCollider.js";
import { CleanupSystem, RigidBody, RigidBodySystem } from "./engine/ecs/components/rigidbody.js";
import { Sprite, SpriteRendererSystem } from "./engine/ecs/components/spriteRenderer.js";
import { ColorData, ColorRendererSystem } from "./engine/ecs/components/colorRenderer.js";
import { Player, PlayerSystem } from "./player.js";
function randint(n) { return Math.round(Math.random() * n); }
function rand(n) { return Math.random() * n; }
export class GameScene extends Scene {
    constructor() {
        super();
        EntityManager.registerComponentSystem(new RigidBodySystem());
        EntityManager.registerComponentSystem(new PlayerSystem());
        EntityManager.registerComponentSystem(new CleanupSystem());
        EntityManager.registerComponentSystem(new SpriteRendererSystem());
        EntityManager.registerComponentSystem(new ColorRendererSystem());
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
        console.log(RectCollider.index, Transform.index, RigidBody.index, Sprite.index, ColorData.index, Player.index);
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
