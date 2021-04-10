#include <vector>
#include <iostream>
#include <bitset>

#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "prefabs.cpp"
#include "vec2.cpp"
#include "matrix.cpp"
#include "components.cpp"
#include "sat.cpp"
#include "scene.cpp"
#include "game.cpp"
#include "network.cpp"
#include "utils.cpp"
#include "scene_view.cpp"

// #define SERVER

#define CLIENT_PREDICTION

using namespace emscripten;

enum Action
{
    forward,
    backward,
    left,
    right,
    interact,
    aim,
    fire,
    MAX = fire
};

World::Scene scene;
double elapsedTime;
std::bitset<Action::MAX + 1> key_state;
std::bitset<Action::MAX + 1> last_key_state;
Vec2 mouse_pos;
Vec2 screen_size;

std::vector<uint8_t> tempBuffer;
std::vector<uint8_t> inBuffer;
std::vector<uint8_t> outBuffer;

World::EntityID user = INVALID_ENTITY;

void calculateMatrix(World::Scene &scene, World::EntityID ent)
{
    Transform *pTransform = scene.Get<Transform>(ent);
    ObjectToWorld *pObjectToWorld = scene.Get<ObjectToWorld>(ent);
    Parent *pParent = scene.Get<Parent>(ent);
    ObjectToWorld *pParentObjectToWorld = scene.Get<ObjectToWorld>(pParent->parent);

    Mat3 identity = Mat3::identity();
    Mat3 scale_v = Mat3::scale(identity, pTransform->scale);
    Mat3 rotate_o = Mat3::rotate(scale_v, pTransform->rotation);
    pObjectToWorld->matrix = pParentObjectToWorld->matrix * Mat3::translate(rotate_o, pTransform->pos);

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return;
    for (World::EntityID ent : pChildren->children)
    {
        calculateMatrix(scene, ent);
    }
}

World::EntityID findClosestDrop(World::EntityID user)
{
    Transform *pUsrTransform = scene.Get<Transform>(user);
    double min_dist = INFINITY;
    World::EntityID closest_drop = INVALID_ENTITY;

    for (World::EntityID ent : SceneView<GroundDrop, Transform>(scene))
    {
        Transform *pTransform = scene.Get<Transform>(ent);

        double sqr_dist = pUsrTransform->pos.sqr_dist(pTransform->pos);
        if (sqr_dist < min_dist && sqr_dist < Game::INTERACT_RANGE * Game::INTERACT_RANGE)
        {
            min_dist = sqr_dist;
            closest_drop = ent;
        }
    }
    return closest_drop;
}

void pickupDrop(World::EntityID user, World::EntityID drop)
{
    HealthPack *pHealthPack = scene.Get<HealthPack>(drop);
    if (pHealthPack != nullptr)
    {
        Health *pHealth = scene.Get<Health>(user);
        pHealth->health = pHealth->max_health;
        scene.Remove<GroundDrop>(drop);
        scene.Assign<DeathAnimator>(drop);
        return;
    }

    AmmoPack *pAmmoPack = scene.Get<AmmoPack>(drop);
    if (pAmmoPack != nullptr)
    {
        Children *pChildren = scene.Get<Children>(user);
        World::EntityID spawnpoint = pChildren->children.back();
        Children *pSpawnpointChildren = scene.Get<Children>(spawnpoint);

        Weapon *pWeapon = scene.Get<Weapon>(pSpawnpointChildren->children[0]);
        pWeapon->ammo = pWeapon->max_ammo;

        scene.Remove<GroundDrop>(drop);
        scene.Assign<DeathAnimator>(drop);
        return;
    }

    Children *pChildren = scene.Get<Children>(drop);
    World::EntityID droppedObj = pChildren->children.back();
    Weapon *pWeapon = scene.Get<Weapon>(droppedObj);

    if (pWeapon != nullptr)
    {
        Children *pChildren = scene.Get<Children>(user);
        World::EntityID spawnpoint = pChildren->children.back();
        Children *pSpawnpointChildren = scene.Get<Children>(spawnpoint);

        Utils::setParent(scene, droppedObj, spawnpoint);
        Transform *pTransform = scene.Get<Transform>(droppedObj);
        pTransform->pos = Vec2::zero();

        if (pSpawnpointChildren->children.size() > 0)
        {
            World::EntityID oldWeapon = pSpawnpointChildren->children[0];
            Utils::setParent(scene, oldWeapon, drop);
            Transform *pTransform = scene.Get<Transform>(oldWeapon);
            pTransform->pos = Vec2::zero();
            pTransform->rotation = 0;
            Despawn *pDespawn = scene.Assign<Despawn>(drop);
            pDespawn->time_to_despawn = 10;
            return;
        }

        scene.Remove<GroundDrop>(drop);
        scene.Assign<DeathAnimator>(drop);
    }
}

void ObjectToWorldSystem(World::Scene &scene)
{
    Children *pChildren = scene.Get<Children>(World::ROOT_ENTITY);

    for (World::EntityID ent : pChildren->children)
    {
        calculateMatrix(scene, ent);
    }
}

void WorldToViewSystem(World::Scene &scene)
{
    Mat3 identity = Mat3::identity();

    for (World::EntityID ent : SceneView<Transform, Camera>(scene, true))
    {
        Transform *pTransform = scene.Get<Transform>(ent);
        Camera *pCamera = scene.Get<Camera>(ent);
        double size = std::min(screen_size.x, screen_size.y);
        Mat3 translate_o = Mat3::translate(identity, pTransform->pos * -1);
        Mat3 rotate_o = Mat3::rotate(translate_o, -pTransform->rotation);
        Mat3 scale_o = Mat3::scale(rotate_o, Vec2(1 / pTransform->scale.x, 1 / pTransform->scale.y));
        Mat3 scale_v = Mat3::scale(scale_o, Vec2(size, size));
        pCamera->world_to_view = Mat3::translate(scale_v, screen_size / 2);
    }
}

void renderEntity(World::Scene &scene, World::EntityID ent, Mat3 &view_matrix)
{
    Color *pColor = scene.Get<Color>(ent);
    ObjectToWorld *pObjectToWorld = scene.Get<ObjectToWorld>(ent);

    if (pColor != nullptr && pObjectToWorld != nullptr)
    {
        Mat3 object_to_view = view_matrix * pObjectToWorld->matrix;
        Outline *pOutline = scene.Get<Outline>(ent);

        EM_ASM({
            Module.context.save();
            Module.context.setTransform($0, $1, $2, $3, $4, $5);
            Module.context.fillStyle = `rgba(${$6}, ${$7}, ${$8}, ${$9})`;
            Module.context.beginPath();
        },
               object_to_view.array[0], object_to_view.array[3], object_to_view.array[1], object_to_view.array[4], object_to_view.array[2], object_to_view.array[5], pColor->r, pColor->g, pColor->b, pColor->a);

        if (pOutline != nullptr)
        {
            EM_ASM({
                Module.context.lineWidth = $0;
                Module.context.strokeStyle = `rgba(${$1}, ${$2}, ${$3}, ${$4})`;
                Module.context.scale(1 - $0 / 2, 1 - $0 / 2);
            },
                   pOutline->thickness, pColor->r, pColor->g, pColor->b, pColor->a);
        }

        Arc *pArcRenderer = scene.Get<Arc>(ent);

        if (pArcRenderer != nullptr)
        {
            EM_ASM({
                Module.context.arc(0, 0, 0.5, $0, $1);
            },
                   pArcRenderer->start_angle, pArcRenderer->end_angle);
        }

        Polygon *pMesh = scene.Get<Polygon>(ent);

        if (pMesh != nullptr)
        {
            if (pMesh->verticies.size() > 2)
            {
                EM_ASM({
                    let verticies = new Float64Array(Module.HEAPF64.buffer, $0, $1 * 2);
                    Module.context.moveTo(verticies[0], verticies[1]);
                    for (let i = 1; i < $1; i++)
                    {
                        Module.context.lineTo(verticies[i * 2], verticies[i * 2 + 1]);
                    }
                },
                       pMesh->verticies.data(), pMesh->verticies.size());
            }
        }

        if (pOutline != nullptr)
        {
            EM_ASM({
                Module.context.stroke();
                Module.context.restore();
            });
        }
        else
        {
            EM_ASM({
                Module.context.fill();
                Module.context.restore();
            });
        }
    }

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return;

    for (World::EntityID ent : pChildren->children)
    {
        renderEntity(scene, ent, view_matrix);
    }
}

void RenderSystem(World::Scene &scene)
{
    Children *pChildren = scene.Get<Children>(World::ROOT_ENTITY);

    for (World::EntityID cam : SceneView<Camera>(scene, true))
    {
        Camera *pCamera = scene.Get<Camera>(cam);

        for (World::EntityID ent : pChildren->children)
        {
            renderEntity(scene, ent, pCamera->world_to_view);
        }
    }
}

void checkCollisionHelper(World::Scene &scene, World::EntityID ent, World::EntityID other, World::EntityID topEnt, World::EntityID otherTopEnt)
{
    if (scene.Get<Collider>(ent) != nullptr)
    {
        Vec2 mtv;

        if (sat(scene, ent, other, mtv))
        {
            World::EntityID collisionEvent = scene.NewEntity(true);
            scene.Assign<Event>(collisionEvent);
            Collision *pCollision = scene.Assign<Collision>(collisionEvent);
            pCollision->source = topEnt;
            pCollision->target = otherTopEnt;
            pCollision->mtv = mtv;
        }
    }

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return;
    for (World::EntityID ent : pChildren->children)
    {
        checkCollisionHelper(scene, ent, other, topEnt, otherTopEnt);
    }
}

void checkCollision(World::Scene &scene, World::EntityID ent, World::EntityID topEnt)
{
    Children *pRootChildren = scene.Get<Children>(World::ROOT_ENTITY);

    if (scene.Get<Collider>(ent) != nullptr)
    {
        for (World::EntityID rootEnt : pRootChildren->children)
        {
            if (topEnt == rootEnt) continue;
            checkCollisionHelper(scene, rootEnt, ent, topEnt, rootEnt);
        }
    }

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return;
    for (World::EntityID ent : pChildren->children)
    {
        checkCollision(scene, ent, topEnt);
    }
}

void RigidbodySystem(World::Scene &scene, double dt)
{
    for (World::EntityID ent : SceneView<Rigidbody, Transform>(scene))
    {
        Transform *pTransform = scene.Get<Transform>(ent);
        Rigidbody *pRigidbody = scene.Get<Rigidbody>(ent);
        pTransform->pos = pTransform->pos + pRigidbody->velocity * dt;
    }
}

void CollisionSystem(World::Scene &scene)
{
    // Generate Collisions
    for (World::EntityID ent : SceneView<ObjectToWorld, Rigidbody, Transform>(scene))
    {
        checkCollision(scene, ent, ent);
    }

    // Resolve Collisions
    for (World::EntityID ent : SceneView<Collision, Event>(scene, true))
    {
        Collision *pCollision = scene.Get<Collision>(ent);
        Transform *pTransform = scene.Get<Transform>(pCollision->source);
        pTransform->pos = pTransform->pos + pCollision->mtv;
    }
}

void EventSystem(World::Scene &scene)
{
    for (World::EntityID ent : SceneView<Event>(scene, true))
    {
        Utils::destroyEntity(scene, ent);
    }
}

void GroundDropSystem(World::Scene &scene, double elapsedTime)
{
    for (World::EntityID ent : SceneView<GroundDrop>(scene))
    {
        double t = (sin(elapsedTime * 3) + 1) / 2;
        Children *pChildren = scene.Get<Children>(ent);
        Transform *pTransform = scene.Get<Transform>(pChildren->children[0]);
        pTransform->scale = Vec2::lerp(Vec2(3.1, 3.1), Vec2(3.2, 3.2), t);
        pTransform = scene.Get<Transform>(pChildren->children[1]);
        pTransform->scale = Vec2::lerp(Vec2(2.5, 2.5), Vec2(2.3, 2.3), t);
        pTransform = scene.Get<Transform>(pChildren->children[2]);
        pTransform->scale = Vec2::lerp(Vec2(1.5, 1.5), Vec2(1.7, 1.7), t);
    }
}

void PlayerActionsSystem(World::Scene &scene)
{
    if (key_state.test(Action::forward) && !last_key_state.test(Action::forward))
    {
        bufferInsert<uint8_t>(outBuffer, Action::forward);
    }
    else if (!key_state.test(Action::forward) && last_key_state.test(Action::forward))
    {
        bufferInsert<uint8_t>(outBuffer, Action::backward);
    }

    if (key_state.test(Action::backward) && !last_key_state.test(Action::backward))
    {
        bufferInsert<uint8_t>(outBuffer, Action::backward);
    }
    else if (!key_state.test(Action::backward) && last_key_state.test(Action::backward))
    {
        bufferInsert<uint8_t>(outBuffer, Action::forward);
    }

    if (key_state.test(Action::left) && !last_key_state.test(Action::left))
    {
        bufferInsert<uint8_t>(outBuffer, Action::left);
    }
    else if (!key_state.test(Action::left) && last_key_state.test(Action::left))
    {
        bufferInsert<uint8_t>(outBuffer, Action::right);
    }

    if (key_state.test(Action::right) && !last_key_state.test(Action::right))
    {
        bufferInsert<uint8_t>(outBuffer, Action::right);
    }
    else if (!key_state.test(Action::right) && last_key_state.test(Action::right))
    {
        bufferInsert<uint8_t>(outBuffer, Action::left);
    }

    if (key_state.test(Action::interact) && !last_key_state.test(Action::interact))
    {
        World::EntityID closest_drop = findClosestDrop(user);
        if (closest_drop != INVALID_ENTITY)
            bufferInsert<uint8_t>(outBuffer, Action::interact);
    }

    for (World::EntityID cam : SceneView<Camera, ObjectToWorld>(scene, true))
    {
        ObjectToWorld *pObjectToWorld = scene.Get<ObjectToWorld>(cam);

        double size = std::min(screen_size.x, screen_size.y);
        Vec2 world_pos = pObjectToWorld->matrix * ((mouse_pos - screen_size / 2) / size);
        Transform *pTransform = scene.Get<Transform>(user);
        bufferInsert<uint8_t>(outBuffer, Action::aim);
        bufferInsert<double>(outBuffer, (world_pos - pTransform->pos).get_angle());
    }
}

void DeathAnimatorSystem(World::Scene &scene, double dt)
{
    for (World::EntityID ent : SceneView<DeathAnimator>(scene))
    {
        Transform *pTransform = scene.Get<Transform>(ent);

        pTransform->scale = Vec2::lerp(pTransform->scale, Vec2::zero(), 10 * dt);
        if (pTransform->scale.sqr_magnitude() <= 0.01)
        {
#ifdef SERVER
            Utils::destroyEntity(scene, ent);
#endif
#ifndef SERVER
            if (World::IsClientEntity(ent))
                Utils::destroyEntity(scene, ent);
#endif
        }
    }
}

void HealthSystem(World::Scene &scene)
{
    for (World::EntityID ent : SceneView<Health>(scene))
    {
        Health *pHealth = scene.Get<Health>(ent);
        Crate *pCrate = scene.Get<Crate>(ent);

        if (pCrate != nullptr)
        {
            Children *pChildren = scene.Get<Children>(ent);
            Color *pColor = scene.Get<Color>(pChildren->children.front());

            double t = (double)pHealth->health / (double)pHealth->max_health;
            pColor->r = Utils::lerp(250, 35, t);
            pColor->g = Utils::lerp(83, 142, t);
            pColor->b = Utils::lerp(41, 249, t);
            // let obj = this.gameObject.instantiate(this.lootPool[Math.round(Math.random() * (this.lootPool.length - 1))]);
            // let drop = this.gameObject.instantiate(GroundDropPrefab, this.gameObject.transform.position);
            // drop.getComponent(GroundDrop)!.obj = obj.getComponent(Interactable);
            // drop.transform.setSiblingIndex(0);
        }

        User *pUser = scene.Get<User>(ent);
        if (pUser != nullptr)
        {
            Children *pChildren = scene.Get<Children>(ent);
            Arc *pArc = scene.Get<Arc>(pChildren->children[pChildren->children.size() - 2]);

            double t = (double)pHealth->health / (double)pHealth->max_health;
            pArc->start_angle = Utils::lerp(3 * M_PI_2 * 0.95, M_PI_2 * 1.05, t);
        }
    }
}

void CameraFollowSystem(World::Scene &scene)
{
    const double MOVEMENT_SPEED = 10;
    for (World::EntityID cam : SceneView<Camera, Transform>(scene, true))
    {
        Transform *pCamTransform = scene.Get<Transform>(cam);

        Transform *pTransform = scene.Get<Transform>(user);
        if (pTransform != nullptr)
            pCamTransform->pos = Vec2::lerp(pCamTransform->pos, pTransform->pos, 0.05);
    }
}

void DespawnSystem(World::Scene &scene, double dt)
{
    for (World::EntityID ent : SceneView<GroundDrop, Despawn>(scene))
    {
        Despawn *pDespawn = scene.Get<Despawn>(ent);

        pDespawn->time_to_despawn -= dt;
        if (pDespawn->time_to_despawn <= 0)
        {
            scene.Remove<GroundDrop>(ent);
            scene.Assign<DeathAnimator>(ent);
        }
    }
}

void ClientNetworkingSystem(World::Scene &scene)
{
    int packetPos = 0;

    World::EntityID newUser = INVALID_ENTITY;
    while (packetPos < inBuffer.size())
    {
        World::EntityID ent = reinterpret_cast<World::EntityID &>(inBuffer[packetPos]);
        packetPos += sizeof(World::EntityID);
        World::ComponentID comp = reinterpret_cast<World::ComponentID &>(inBuffer[packetPos]);
        packetPos += sizeof(World::ComponentID);

        NetworkOp op = static_cast<NetworkOp>(comp >> 30);
        comp = comp & ((1U << 30U) - 1U);

        switch (op)
        {
            case NetworkOp::setUser:
            {
                std::cout << "UserId: " << ent << std::endl;
                newUser = ent;
                break;
            }
            case NetworkOp::create:
            {
                // Entity
                if (comp == 0)
                    scene.NewEntity(ent);
                else if (comp == World::GetId<Transform>())
                    scene.Assign<Transform>(ent);
                else if (comp == World::GetId<ObjectToWorld>())
                    scene.Assign<ObjectToWorld>(ent);
                else if (comp == World::GetId<Parent>())
                    scene.Assign<Parent>(ent);
                else if (comp == World::GetId<Despawn>())
                    scene.Assign<Despawn>(ent);
                else if (comp == World::GetId<Children>())
                    scene.Assign<Children>(ent);
                else if (comp == World::GetId<Collider>())
                    scene.Assign<Collider>(ent);
                else if (comp == World::GetId<Rigidbody>())
                    scene.Assign<Rigidbody>(ent);
                else if (comp == World::GetId<Collision>())
                    scene.Assign<Collision>(ent);
                else if (comp == World::GetId<GroundDrop>())
                    scene.Assign<GroundDrop>(ent);
                else if (comp == World::GetId<Event>())
                    scene.Assign<Event>(ent);
                else if (comp == World::GetId<Camera>())
                    scene.Assign<Camera>(ent);
                else if (comp == World::GetId<User>())
                    scene.Assign<User>(ent);
                else if (comp == World::GetId<HealthPack>())
                    scene.Assign<HealthPack>(ent);
                else if (comp == World::GetId<AmmoPack>())
                    scene.Assign<AmmoPack>(ent);
                else if (comp == World::GetId<DeathAnimator>())
                    scene.Assign<DeathAnimator>(ent);
                else if (comp == World::GetId<Health>())
                    scene.Assign<Health>(ent);
                else if (comp == World::GetId<Weapon>())
                    scene.Assign<Weapon>(ent);
                else if (comp == World::GetId<Bullet>())
                    scene.Assign<Bullet>(ent);
                else if (comp == World::GetId<AI>())
                    scene.Assign<AI>(ent);
                else if (comp == World::GetId<Crate>())
                    scene.Assign<Crate>(ent);
                else if (comp == World::GetId<Color>())
                    scene.Assign<Color>(ent);
                else if (comp == World::GetId<Outline>())
                    scene.Assign<Outline>(ent);
                else if (comp == World::GetId<Renderer>())
                    scene.Assign<Renderer>(ent);
                else if (comp == World::GetId<Arc>())
                    scene.Assign<Arc>(ent);
                else if (comp == World::GetId<Polygon>())
                    scene.Assign<Polygon>(ent);
                break;
            }
            case NetworkOp::modify:
            {
                if (comp == World::GetId<Polygon>())
                {
                    int size = reinterpret_cast<int &>(inBuffer[packetPos]);
                    packetPos += sizeof(int);

                    Polygon *pPolygon = scene.Get<Polygon>(ent);

                    pPolygon->verticies.resize(size);

                    for (int i = 0; i < size; i++)
                        pPolygon->verticies[i] = reinterpret_cast<Vec2 *>(&inBuffer[packetPos])[i];

                    packetPos += size * sizeof(Vec2);
                    continue;
                }

                if (comp == World::GetId<Children>())
                {
                    int size = reinterpret_cast<int &>(inBuffer[packetPos]);
                    packetPos += sizeof(int);

                    Children *pChildren = scene.Get<Children>(ent);

                    std::vector<World::EntityID> clientEntities;
                    for (World::EntityID child : pChildren->children)
                    {
                        if (World::IsClientEntity(child))
                            clientEntities.push_back(child);
                    }

                    pChildren->children.resize(size + clientEntities.size());

                    for (int i = 0; i < size; i++)
                        pChildren->children[i] = reinterpret_cast<World::EntityID *>(&inBuffer[packetPos])[i];

                    for (int i = 0; i < clientEntities.size(); i++)
                        pChildren->children[size + i] = clientEntities[i];

                    packetPos += size * sizeof(World::EntityID);
                    continue;
                }

                int compSize = scene.GetComponentSize(comp);
                packetPos += compSize;

                uint8_t *compData = reinterpret_cast<uint8_t *>(scene.Get(ent, comp));
                if (compData == nullptr) break;

                for (int i = 0; i < compSize; i++) compData[i] = inBuffer[packetPos - compSize + i];
                break;
            }
            case NetworkOp::destroy:
            {
                if (comp == 0)
                {
                    scene.DestroyEntity(ent);
                }
                else
                {
                    scene.Remove(ent, comp);
                }
                break;
            }
        }
    }

    if (newUser != INVALID_ENTITY)
    {
        if (user == INVALID_ENTITY)
        {
            // Camera
            {
                World::EntityID camera = scene.NewEntity(true);

                Transform *pTransform = Utils::assignTransform(scene, camera);
                pTransform->scale = Vec2(30, 30);

                scene.Assign<Camera>(camera);
            }
        }
        user = newUser;
    }

    inBuffer.clear();

    sendBuffer(outBuffer);
    outBuffer.clear();
}

void ServerNetworkingSystem(World::Scene &scene)
{
    for (World::ComponentID comp = 1; comp < MAX_COMPONENT + 1; comp++)
    {
        for (World::EntityID ent : SceneView<>(scene))
        {
            uint8_t *componentData = reinterpret_cast<uint8_t *>(scene.Get(ent, comp));
            if (componentData == nullptr) continue;

            bufferInsert<World::EntityID>(outBuffer, ent);
            bufferInsert<World::ComponentID>(outBuffer, comp | (NetworkOp::modify << 30));

            if (comp == World::GetId<Polygon>())
            {
                Polygon *pPolygon = scene.Get<Polygon>(ent);
                bufferInsert<int>(outBuffer, pPolygon->verticies.size());
                for (int i = 0; i < pPolygon->verticies.size(); i++) bufferInsert<Vec2>(outBuffer, pPolygon->verticies[i]);
                continue;
            }

            if (comp == World::GetId<Children>())
            {
                Children *pChildren = scene.Get<Children>(ent);
                bufferInsert<int>(outBuffer, pChildren->children.size());
                for (int i = 0; i < pChildren->children.size(); i++) bufferInsert<World::EntityID>(outBuffer, pChildren->children[i]);
                continue;
            }

            for (int i = 0; i < scene.GetComponentSize(comp); i++) outBuffer.push_back(componentData[i]);
        }
    }

    for (World::EntityID ent : SceneView<User>(scene))
    {
        reinterpret_cast<World::EntityID &>(outBuffer[0]) = ent;
        sendBuffer(outBuffer);
    }

    outBuffer.clear();
    bufferInsert<World::EntityID>(outBuffer, INVALID_ENTITY);

    // Handle client actions
    int packetPos = 0;
    while (packetPos < inBuffer.size())
    {
        World::EntityID user = reinterpret_cast<World::EntityID &>(inBuffer[packetPos]);
        packetPos += sizeof(World::EntityID);

        uint32_t size = reinterpret_cast<uint32_t &>(inBuffer[packetPos]);
        packetPos += sizeof(uint32_t);

        while (size > 0)
        {
            size--;
            switch ((Action)inBuffer[packetPos++])
            {
                case Action::forward:
                {
                    Rigidbody *pRigidbody = scene.Get<Rigidbody>(user);
                    if (pRigidbody == nullptr) break;
                    pRigidbody->velocity.y = Utils::clamp(pRigidbody->velocity.y - Game::MOVEMENT_SPEED, -Game::MOVEMENT_SPEED, Game::MOVEMENT_SPEED);
                    break;
                }
                case Action::backward:
                {
                    Rigidbody *pRigidbody = scene.Get<Rigidbody>(user);
                    if (pRigidbody == nullptr) break;
                    pRigidbody->velocity.y = Utils::clamp(pRigidbody->velocity.y + Game::MOVEMENT_SPEED, -Game::MOVEMENT_SPEED, Game::MOVEMENT_SPEED);
                    break;
                }
                case Action::left:
                {
                    Rigidbody *pRigidbody = scene.Get<Rigidbody>(user);
                    if (pRigidbody == nullptr) break;
                    pRigidbody->velocity.x = Utils::clamp(pRigidbody->velocity.x - Game::MOVEMENT_SPEED, -Game::MOVEMENT_SPEED, Game::MOVEMENT_SPEED);
                    break;
                }
                case Action::right:
                {
                    Rigidbody *pRigidbody = scene.Get<Rigidbody>(user);
                    if (pRigidbody == nullptr) break;
                    pRigidbody->velocity.x = Utils::clamp(pRigidbody->velocity.x + Game::MOVEMENT_SPEED, -Game::MOVEMENT_SPEED, Game::MOVEMENT_SPEED);
                    break;
                }
                case Action::interact:
                {
                    World::EntityID closest_drop = findClosestDrop(user);
                    if (closest_drop == INVALID_ENTITY) break;
                    pickupDrop(user, closest_drop);
                    break;
                }
                case Action::aim:
                {
                    if (size < sizeof(double))
                    {
                        // Ignore Remaining messages for client
                        packetPos += size;
                        size = 0;
                        break;
                    }

                    double forward = fmod(reinterpret_cast<double &>(inBuffer[packetPos]), 360);
                    packetPos += sizeof(double);
                    size -= sizeof(double);

                    Transform *pTransform = scene.Get<Transform>(user);
                    if (pTransform == nullptr) break;

                    pTransform->rotation = forward;
                    break;
                }
                default:
                {
                    // Ignore Remaining messages for client
                    packetPos += size;
                    size = 0;
                    break;
                }
            }
        }
    }
    inBuffer.clear();
}

void onMouseDown(int x, int y, int button)
{
    if (button == 0)
        key_state.set(Action::fire);
    mouse_pos.x = x;
    mouse_pos.y = y;
}

void onMouseMove(int x, int y)
{
    mouse_pos.x = x;
    mouse_pos.y = y;
}

void onMouseUp(int x, int y, int button)
{
    if (button == 0)
        key_state.reset(Action::fire);
    mouse_pos.x = x;
    mouse_pos.y = y;
}

void onKeyDown(int key)
{
    key_state.set(key);
}

void onKeyUp(int key)
{
    key_state.reset(key);
}

uint32_t onPacket(int size)
{
    inBuffer.resize(inBuffer.size() + size);
    return reinterpret_cast<uint32_t>(&inBuffer[inBuffer.size() - size]);
}

void onDisconnect(uint32_t index, uint32_t version)
{
    World::EntityID user = World::CreateEntityId(index, version);
    std::cout << "Disconnected, UserId: " << user << std::endl;
    Utils::destroyEntity(scene, user);
}

uint32_t onConnect()
{
    World::EntityID *user = new World::EntityID;
    *user = Game::spawnPlayerRand(scene);
    std::cout << "Connected, UserId: " << *user << std::endl;
    return reinterpret_cast<uint32_t>(user);
}

void stateSync(uint32_t buffer)
{
    World::EntityID *user = reinterpret_cast<World::EntityID *>(buffer);
    std::cout << "Sync start, UserId: " << *user << std::endl;

    tempBuffer.clear();
    bufferInsert<World::EntityID>(tempBuffer, *user);
    bufferInsert<World::EntityID>(tempBuffer, *user);
    bufferInsert<World::ComponentID>(tempBuffer, 0 | (NetworkOp::setUser << 30));

    for (World::EntityID ent : SceneView<>(scene))
    {
        bufferInsert<World::EntityID>(tempBuffer, ent);
        bufferInsert<World::ComponentID>(tempBuffer, 0 | (NetworkOp::create << 30));
    }

    for (World::ComponentID comp = 1; comp < MAX_COMPONENT + 1; comp++)
    {
        for (World::EntityID ent : SceneView<>(scene))
        {
            if (scene.Get(ent, comp) == nullptr) continue;

            bufferInsert<World::EntityID>(tempBuffer, ent);
            bufferInsert<World::ComponentID>(tempBuffer, comp | (NetworkOp::create << 30));
        }
    }

    sendBuffer(tempBuffer);
    delete user;
}

void update(double dt)
{
#ifndef SERVER
    screen_size.x = EM_ASM_DOUBLE({
        Module.canvas.width = Module.canvas.clientWidth;
        return Module.canvas.width;
    });

    screen_size.y = EM_ASM_DOUBLE({
        Module.canvas.height = Module.canvas.clientHeight;
        return Module.canvas.height;
    });

    EM_ASM({
        let context = Module.context;
        context.clearRect(0, 0, $1, $2);
    },
           screen_size.x, screen_size.y);
#endif

    elapsedTime += dt;

#ifdef SERVER
    RigidbodySystem(scene, dt);
    ObjectToWorldSystem(scene);
    CollisionSystem(scene);
    ObjectToWorldSystem(scene);
    DespawnSystem(scene, dt);
    GroundDropSystem(scene, elapsedTime);
    DeathAnimatorSystem(scene, dt);
    HealthSystem(scene);
    EventSystem(scene);
    ServerNetworkingSystem(scene);
#endif

#ifndef SERVER

    if (user != INVALID_ENTITY)
    {
#ifdef CLIENT_PREDICTION
        RigidbodySystem(scene, dt);
        ObjectToWorldSystem(scene);
        CollisionSystem(scene);
#endif
        ObjectToWorldSystem(scene);
        CameraFollowSystem(scene);
        WorldToViewSystem(scene);
        PlayerActionsSystem(scene);
#ifdef CLIENT_PREDICTION
        // GroundDropSystem(scene, elapsedTime);
        // DeathAnimatorSystem(scene, dt);
        // HealthSystem(scene);
        EventSystem(scene);
#endif
        RenderSystem(scene);
    }
    ClientNetworkingSystem(scene);
#endif
    last_key_state = key_state;
}

void stop()
{
#ifdef SERVER
    EM_ASM({
        clearTimeout(Module.loop);
        clearInterval(Module.interval);
        Module.socket.terminate();
    });
#endif
#ifndef SERVER
    EM_ASM({
        cancelAnimationFrame(Module.loop);
        Module.canvas.onmousedown = function(){};
        Module.canvas.onmouseup = function(){};
        Module.canvas.onmousemove = function(){};
        Module.canvas.onkeydown = function(){};
        Module.canvas.onkeyup = function(){};
        Module.socket.close();
    });
#endif
}

void start()
{
    // Reset
    scene = World::Scene();
    elapsedTime = 0;
    key_state = {0};
    last_key_state = {0};
    mouse_pos = Vec2(0, 0);
    screen_size = Vec2(0, 0);
    tempBuffer.clear();
    inBuffer.clear();
    outBuffer.clear();
    user = INVALID_ENTITY;

#ifndef SERVER
    EM_ASM({
        Module.canvas = document.getElementById('canvas');
        Module.context = Module.canvas.getContext('2d');

        let keyMap = ({'w' : 0, 's' : 1, 'a' : 2, 'd' : 3, 'e' : 4});

        Module.canvas.onmousedown = function(evt) { Module.onMouseDown(evt.clientX, evt.clientY, evt.button); };
        Module.canvas.onmouseup = function(evt) { Module.onMouseUp(evt.clientX, evt.clientY, evt.button); };
        Module.canvas.onmousemove = function(evt) { Module.onMouseMove(evt.clientX, evt.clientY); };
        Module.canvas.onkeydown = function(evt)
        {
            let key = keyMap[evt.key];
            if (key != null)
                Module.onKeyDown(key);
        };
        Module.canvas.onkeyup = function(evt)
        {
            let key = keyMap[evt.key];
            if (key != null)
                Module.onKeyUp(key);
        };

        let lastTime = performance.now();

        function update(timestamp)
        {
            let dt = Math.min((timestamp - lastTime) / 1000, 1 / 60);
            lastTime = timestamp;
            Module.update(dt);
            Module.loop = window.requestAnimationFrame(update);
        }

        Module.loop = window.requestAnimationFrame(update);

        // SETUP WEBSOCKET
        console.log('attempting connection to ws://' + window.location.hostname + ':' + $0);

        Module.socket = new WebSocket('ws://' + window.location.hostname + ':' + $0);
        Module.socket.binaryType = 'arraybuffer';

        Module.socket.onclose = function(event)
        {
            Module.stop();
            console.log('closed code:' + event.code + ' reason:' + event.reason + ' wasClean:' + event.wasClean);
        };
        Module.socket.onmessage = function(event)
        {
            let array = new Uint8Array(event.data);
            let buffer = Module.onPacket(array.length);
            new Uint8Array(Module.HEAPU8.buffer).set(array, buffer);
        };
        Module.socket.onopen = function(event)
        {
            console.log('connected');
        };
    },
           PORT);
#endif

#ifdef SERVER
    bufferInsert<World::EntityID>(outBuffer, INVALID_ENTITY);
    EM_ASM({
        const Server = require('ws').Server;
        const process = require('process');
        Module.socket = new Server({port : $0});
        Module.socket.binaryType = 'arraybuffer';

        Module.socket.on(
            'listening', function() {
                console.log('Started on port ' + $0);
            });

        function heartbeat()
        {
            this.isAlive = true;
        }

        function noop() {}

        Module.socket.on(
            'connection', function(ws) {
                ws.isAlive = true;
                ws.on('pong', heartbeat);
                ws.on(
                    'close', function() { Module.onDisconnect(ws.entityIndex, ws.entityVersion); });

                ws.on(
                    'message', function(event) {
                        let array = new Uint8Array(event);
                        let buffer = Module.onPacket(array.length + 12);
                        let view = new DataView(Module.HEAPU8.buffer);
                        view.setUint32(buffer, ws.entityVersion, true);
                        view.setUint32(buffer + 4, ws.entityIndex, true);
                        view.setUint32(buffer + 8, array.length, true);
                        new Uint8Array(Module.HEAPU8.buffer).set(array, buffer + 12);
                    });

                let user = Module.onConnect();
                let entity = new Uint32Array(Module.HEAPU8.buffer, user, 8);

                ws.entityVersion = entity[0];
                ws.entityIndex = entity[1];

                Module.stateSync(user);
            });

        function getTime()
        {
            let time = process.hrtime();
            return (time[0] * 1000) + (time[1] / 1000000);
        }

        Module.loop = 0;
        let lastTime = getTime();

        function update()
        {
            let timestamp = getTime();
            let dt = Math.min((timestamp - lastTime) / 1000, 1 / 60);
            lastTime = timestamp;
            Module.update(dt);
            Module.loop = setTimeout(update, (1 / 60) * 1000);
        }

        Module.loop = setTimeout(update, 0);

        Module.interval = setInterval(
            function ping() {
                for (let ws of Module.socket.clients)
                {
                    if (!ws.isAlive)
                    {
                        Module.onDisconnect(ws.entityIndex, ws.entityVersion);
                        return ws.terminate();
                    }

                    ws.isAlive = false;
                    ws.ping(noop);
                }
            },
            5000);
    },
           PORT);
    World::EntityID root = scene.NewEntity();
    assert(root == World::ROOT_ENTITY);

    Transform *pTransform = scene.Assign<Transform>(World::ROOT_ENTITY);
    scene.Assign<ObjectToWorld>(World::ROOT_ENTITY);
    scene.Assign<Children>(World::ROOT_ENTITY);
    Game::loadScene(scene);
#endif
}

int main(int argc, char *argv[])
{
#ifdef SERVER
    start();
#endif
    return 0;
}

EMSCRIPTEN_BINDINGS(my_module)
{
    // value_array<Vec2>("Vec2")
    //     .element(&Vec2::x)
    //     .element(&Vec2::y);
    // register_vector<Vec2>("vector<Vec2>");
    function("update", &update);
    function("onMouseDown", &onMouseDown);
    function("onMouseMove", &onMouseMove);
    function("onMouseUp", &onMouseUp);
    function("onKeyDown", &onKeyDown);
    function("onKeyUp", &onKeyUp);
    function("onPacket", &onPacket);
    function("onConnect", &onConnect);
    function("stateSync", &stateSync);
    function("onDisconnect", &onDisconnect);
    function("start", &start);
    function("stop", &stop);
}