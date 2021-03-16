import { Component, IComponentData } from "./engine/ecs/component.js";
import { IComponentSystem } from "./engine/ecs/componentSystem.js";
import { IJobForEach, IJobForEachWithEntity, JobForEach } from "./engine/ecs/job.js";
import { Time } from "./engine/time.js";
import { Input } from "./engine/input.js";

// Components
import { CollisionEvent, RigidBody } from "./engine/ecs/components/rigidbody.js";
import { Transform } from "./engine/ecs/components/transform.js";
import { EntityID, EntityManager } from "./engine/ecs/entity.js";
import { Bullet } from "./bullet.js";
import { RectCollider } from "./engine/ecs/components/rectCollider.js";
import { ColorData } from "./engine/ecs/components/colorRenderer.js";
import { Color } from "./engine/math/color.js";
import { Vec2 } from "./engine/math/vector.js";

@Component
export class Player extends IComponentData {
    constructor(
        public speed: number = 100
    ) { super() }
}

@JobForEach(Player, RigidBody, Transform)
export class PlayerJob extends IJobForEachWithEntity {

    execute(entity: EntityID, index: number, player: Player, rigidBody: RigidBody, transform: Transform) {
        rigidBody.velocity.set_s(
            Input.getAxis("x") * -player.speed,
            Input.getAxis("y") * -player.speed
        );

        let v = transform.position.sub(Input.mousePos);
        let rotation = (Math.atan2(v.y, v.x) - transform.rotation) % (2 * Math.PI);
        rigidBody.torque = rotation > Math.PI ? Math.PI - rotation : rotation / Time.fixedDeltaTime;

        if (Input.getButton("fire")) {
            console.log("DOWN");
            let ent = EntityManager.createEntity();
            EntityManager.addComponent(ent, Bullet);
            EntityManager.addComponent(ent, Transform);
            EntityManager.addComponent(ent, RigidBody);
            EntityManager.addComponent(ent, RectCollider);
            EntityManager.addComponent(ent, ColorData);

            let direction = new Vec2(v.x, v.y).normalize().i_mul_s(-1);
            EntityManager.setComponentData(ent, new Bullet(entity));
            EntityManager.setComponentData(ent, new Transform(transform.position.add(direction.mul_s(100)), transform.rotation, new Vec2(10, 10)));
            EntityManager.setComponentData(ent, new RigidBody(direction.mul_s(1000)));
            EntityManager.setComponentData(ent, new ColorData(new Color(255, 0, 0)));
        }
    }
}

export class PlayerSystem extends IComponentSystem {
    onUpdate() {
        let playerJob = new PlayerJob();
        let collisionJob = new PlayerCollisionJob();

        playerJob.scheduleParallel();
        collisionJob.scheduleParallel();
    }
}

@JobForEach(CollisionEvent)
export class PlayerCollisionJob extends IJobForEachWithEntity {

    execute(entity: EntityID, index: number, collision: CollisionEvent) {
        if (EntityManager.hasComponent(collision.entity, Player) &&
            EntityManager.hasComponent(collision.other, Bullet) &&
            EntityManager.isSameEntity(EntityManager.getComponent(collision.other, Bullet)!.owner, collision.entity)) {
            EntityManager.destroyEntity(collision.entity);
            EntityManager.destroyEntity(collision.other);
            console.log(":HERE");
            return;
        }

        if (EntityManager.hasComponent(collision.entity, Bullet)) {
            EntityManager.destroyEntity(collision.entity);
            console.log(":HERE");
        }

        if (EntityManager.hasComponent(collision.other, Bullet)) {
            EntityManager.destroyEntity(collision.other);
            console.log(":HERE");
        }
        EntityManager.destroyEntity(entity);
    }
}