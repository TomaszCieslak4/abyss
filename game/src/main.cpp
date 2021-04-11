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

Scene scene;
double elapsedTime;
std::bitset<Action::MAX + 1> key_state;
std::bitset<Action::MAX + 1> last_key_state;
Vec2 mouse_pos;
Vec2 screen_size;

bool isDead = false;
bool connected = false;
bool stopped = true;

std::vector<uint8_t> tempBuffer;
std::vector<uint8_t> inBuffer;
std::vector<uint8_t> outBuffer;

EntityID clientUser = INVALID_ENTITY;

void calculateMatrix(Scene &scene, EntityID ent)
{
    component::Transform *pTransform = scene.Get<component::Transform>(ent);
    component::ObjectToWorld *pObjectToWorld = scene.Get<component::ObjectToWorld>(ent);
    component::Parent *pParent = scene.Get<component::Parent>(ent);
    component::ObjectToWorld *pParentObjectToWorld = scene.DirtyGet<component::ObjectToWorld>(pParent->parent);

    Mat3 identity = Mat3::identity();
    Mat3 scale_v = Mat3::scale(identity, pTransform->scale);
    Mat3 rotate_o = Mat3::rotate(scale_v, pTransform->rotation);
    pObjectToWorld->matrix = pParentObjectToWorld->matrix * Mat3::translate(rotate_o, pTransform->pos);

    component::Children *pChildren = scene.Get<component::Children>(ent);
    if (pChildren == nullptr) return;
    for (EntityID ent : pChildren->children)
    {
        calculateMatrix(scene, ent);
    }
}

EntityID findClosestDrop(EntityID user)
{
    component::Transform *pUsrTransform = scene.Get<component::Transform>(user);
    double min_dist = INFINITY;
    EntityID closest_drop = INVALID_ENTITY;

    for (EntityID ent : SceneView<component::GroundDrop, component::Transform>(scene))
    {
        component::Transform *pTransform = scene.Get<component::Transform>(ent);

        double sqr_dist = pUsrTransform->pos.sqr_dist(pTransform->pos);
        if (sqr_dist < min_dist && sqr_dist < Game::INTERACT_RANGE * Game::INTERACT_RANGE)
        {
            min_dist = sqr_dist;
            closest_drop = ent;
        }
    }
    return closest_drop;
}

EntityID getPlayerWeapon(EntityID user)
{
    component::Children *pChildren = scene.Get<component::Children>(user);
    EntityID spawnpoint = pChildren->children.back();
    component::Children *pSpawnpointChildren = scene.Get<component::Children>(spawnpoint);
    return pSpawnpointChildren->children[0];
}

void pickupDrop(EntityID user, EntityID drop)
{
    component::HealthPack *pHealthPack = scene.Get<component::HealthPack>(drop);
    if (pHealthPack != nullptr)
    {
        component::Health *pHealth = scene.DirtyGet<component::Health>(user);
        pHealth->health = pHealth->max_health;
        scene.Remove<component::GroundDrop>(drop);
        scene.Assign<component::DeathAnimator>(drop, false);

        Game::spawnEntityRand(scene, ROOT_ENTITY, Game::Spawn::health, 1);
        return;
    }

    component::AmmoPack *pAmmoPack = scene.Get<component::AmmoPack>(drop);
    if (pAmmoPack != nullptr)
    {
        component::Weapon *pWeapon = scene.DirtyGet<component::Weapon>(getPlayerWeapon(user));
        pWeapon->ammo = pWeapon->max_ammo;

        scene.Remove<component::GroundDrop>(drop);
        scene.Assign<component::DeathAnimator>(drop, false);
        Game::spawnEntityRand(scene, ROOT_ENTITY, Game::Spawn::ammo, 1);
        return;
    }

    component::Children *pChildren = scene.Get<component::Children>(drop);
    EntityID droppedObj = pChildren->children.back();
    component::Weapon *pWeapon = scene.DirtyGet<component::Weapon>(droppedObj);

    if (pWeapon != nullptr)
    {
        component::Children *pChildren = scene.Get<component::Children>(user);
        EntityID spawnpoint = pChildren->children.back();
        component::Children *pSpawnpointChildren = scene.Get<component::Children>(spawnpoint);

        Utils::setParent(scene, droppedObj, spawnpoint);
        component::Transform *pTransform = scene.DirtyGet<component::Transform>(droppedObj);
        pTransform->pos = Vec2::zero();

        if (pSpawnpointChildren->children.size() > 0)
        {
            EntityID oldWeapon = pSpawnpointChildren->children[0];
            Utils::setParent(scene, oldWeapon, drop);
            component::Transform *pTransform = scene.DirtyGet<component::Transform>(oldWeapon);
            pTransform->pos = Vec2::zero();
            pTransform->rotation = 0;
            component::Despawn *pDespawn = scene.DirtyAssign<component::Despawn>(drop);
            pDespawn->time_to_despawn = 10;
            return;
        }

        scene.Remove<component::GroundDrop>(drop);
        scene.Assign<component::DeathAnimator>(drop, false);
    }
}

void ObjectToWorldSystem(Scene &scene)
{
    component::Children *pChildren = scene.Get<component::Children>(ROOT_ENTITY);

    for (EntityID ent : pChildren->children)
    {
        calculateMatrix(scene, ent);
    }
}

void WorldToViewSystem(Scene &scene)
{
    Mat3 identity = Mat3::identity();

    for (EntityID ent : SceneView<component::Transform, component::Camera>(scene, true))
    {
        component::Transform *pTransform = scene.Get<component::Transform>(ent);
        component::Camera *pCamera = scene.Get<component::Camera>(ent);
        double size = std::min(screen_size.x, screen_size.y);
        Mat3 translate_o = Mat3::translate(identity, pTransform->pos * -1);
        Mat3 rotate_o = Mat3::rotate(translate_o, -pTransform->rotation);
        Mat3 scale_o = Mat3::scale(rotate_o, Vec2(1 / pTransform->scale.x, 1 / pTransform->scale.y));
        Mat3 scale_v = Mat3::scale(scale_o, Vec2(size, size));
        pCamera->world_to_view = Mat3::translate(scale_v, screen_size / 2);
    }
}

void renderEntity(Scene &scene, EntityID ent, Mat3 &view_matrix)
{
    component::Color *pColor = scene.Get<component::Color>(ent);
    component::ObjectToWorld *pObjectToWorld = scene.Get<component::ObjectToWorld>(ent);

    if (pColor != nullptr && pObjectToWorld != nullptr)
    {
        Mat3 object_to_view = view_matrix * pObjectToWorld->matrix;
        component::Outline *pOutline = scene.Get<component::Outline>(ent);

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

        component::Arc *pArcRenderer = scene.Get<component::Arc>(ent);

        if (pArcRenderer != nullptr)
        {
            EM_ASM({
                Module.context.arc(0, 0, 0.5, $0, $1);
            },
                   pArcRenderer->start_angle, pArcRenderer->end_angle);
        }

        component::Polygon *pMesh = scene.Get<component::Polygon>(ent);

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

    component::Children *pChildren = scene.Get<component::Children>(ent);
    if (pChildren == nullptr) return;

    for (EntityID ent : pChildren->children)
    {
        renderEntity(scene, ent, view_matrix);
    }
}

void RenderSystem(Scene &scene)
{
    component::Children *pChildren = scene.Get<component::Children>(ROOT_ENTITY);

    for (EntityID cam : SceneView<component::Camera>(scene, true))
    {
        component::Camera *pCamera = scene.Get<component::Camera>(cam);

        for (EntityID ent : pChildren->children)
        {
            renderEntity(scene, ent, pCamera->world_to_view);
        }
    }
}

void checkCollisionHelper(Scene &scene, EntityID ent, EntityID other, EntityID topEnt, EntityID otherTopEnt)
{
    if (scene.Get<component::Collider>(ent) != nullptr)
    {
        Vec2 mtv;

        if (sat(scene, ent, other, mtv))
        {
            EntityID collisionEvent = scene.NewEntity(true);
            scene.Assign<component::Event>(collisionEvent);
            component::Collision *pCollision = scene.DirtyAssign<component::Collision>(collisionEvent);
            pCollision->source = topEnt;
            pCollision->target = otherTopEnt;
            pCollision->mtv = mtv;
        }
    }

    component::Children *pChildren = scene.Get<component::Children>(ent);
    if (pChildren == nullptr) return;
    for (EntityID ent : pChildren->children)
    {
        checkCollisionHelper(scene, ent, other, topEnt, otherTopEnt);
    }
}

void checkCollision(Scene &scene, EntityID ent, EntityID topEnt)
{
    component::Children *pRootChildren = scene.Get<component::Children>(ROOT_ENTITY);

    if (scene.Get<component::Collider>(ent) != nullptr)
    {
        for (EntityID rootEnt : pRootChildren->children)
        {
            if (topEnt == rootEnt) continue;
            checkCollisionHelper(scene, rootEnt, ent, topEnt, rootEnt);
        }
    }

    component::Children *pChildren = scene.Get<component::Children>(ent);
    if (pChildren == nullptr) return;
    for (EntityID ent : pChildren->children)
    {
        checkCollision(scene, ent, topEnt);
    }
}

void RigidbodySystem(Scene &scene, double dt)
{
    for (EntityID ent : SceneView<component::Rigidbody, component::Transform>(scene))
    {
        component::Rigidbody *pRigidbody = scene.Get<component::Rigidbody>(ent);
        if (pRigidbody->velocity.sqr_magnitude() > 0.001)
        {
            component::Transform *pTransform = scene.DirtyGet<component::Transform>(ent);
            pTransform->pos = pTransform->pos + pRigidbody->velocity * dt;
        }
    }
}

void CollisionSystem(Scene &scene)
{
    // Generate Collisions
    for (EntityID ent : SceneView<component::ObjectToWorld, component::Rigidbody, component::Transform>(scene))
    {
        checkCollision(scene, ent, ent);
    }

    // Resolve Collisions
    for (EntityID ent : SceneView<component::Collision, component::Event>(scene, true))
    {
        component::Collision *pCollision = scene.Get<component::Collision>(ent);
        component::Transform *pTransform = scene.DirtyGet<component::Transform>(pCollision->source);
        pTransform->pos = pTransform->pos + pCollision->mtv;
    }
}

void EventSystem(Scene &scene)
{
    for (EntityID ent : SceneView<component::Event>(scene, true))
    {
        Utils::destroyEntity(scene, ent);
    }
}

void GroundDropSystem(Scene &scene, double elapsedTime)
{
    for (EntityID ent : SceneView<component::GroundDrop>(scene))
    {
        double t = (sin(elapsedTime * 3) + 1) / 2;
        component::Children *pChildren = scene.Get<component::Children>(ent);
        component::Transform *pTransform = scene.DirtyGet<component::Transform>(pChildren->children[0]);
        pTransform->scale = Vec2::lerp(Vec2(3.1, 3.1), Vec2(3.2, 3.2), t);
        pTransform = scene.DirtyGet<component::Transform>(pChildren->children[1]);
        pTransform->scale = Vec2::lerp(Vec2(2.5, 2.5), Vec2(2.3, 2.3), t);
        pTransform = scene.DirtyGet<component::Transform>(pChildren->children[2]);
        pTransform->scale = Vec2::lerp(Vec2(1.5, 1.5), Vec2(1.7, 1.7), t);
    }
}

void PlayerActionsSystem(Scene &scene)
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
        bufferInsert<uint8_t>(outBuffer, Action::interact);
    }

    if (key_state.test(Action::fire) && !last_key_state.test(Action::fire))
    {
        bufferInsert<uint8_t>(outBuffer, Action::fire);
    }

    for (EntityID cam : SceneView<component::Camera, component::ObjectToWorld>(scene, true))
    {
        component::ObjectToWorld *pObjectToWorld = scene.Get<component::ObjectToWorld>(cam);

        double size = std::min(screen_size.x, screen_size.y);
        Vec2 world_pos = pObjectToWorld->matrix * ((mouse_pos - screen_size / 2) / size);
        component::Transform *pTransform = scene.Get<component::Transform>(clientUser);
        bufferInsert<uint8_t>(outBuffer, Action::aim);
        bufferInsert<double>(outBuffer, (world_pos - pTransform->pos).get_angle());
    }
}

void DeathAnimatorSystem(Scene &scene, double dt)
{
    for (EntityID ent : SceneView<component::DeathAnimator>(scene))
    {
        component::Transform *pTransform = scene.DirtyGet<component::Transform>(ent);
        if (pTransform == nullptr) continue;

        pTransform->scale = Vec2::lerp(pTransform->scale, Vec2::zero(), Game::ANIMATION_SPEED * dt);
        if (scene.Get<component::User>(ent) != nullptr) continue;
        if (pTransform->scale.sqr_magnitude() <= 0.01)
        {
#ifdef SERVER
            Utils::destroyEntity(scene, ent);
#endif
#ifndef SERVER
            if (IsClientEntity(ent))
                Utils::destroyEntity(scene, ent);
#endif
        }
    }
}

void HealthSystem(Scene &scene, double dt)
{
    for (EntityID ent : SceneView<component::Health>(scene))
    {
        component::Health *pHealth = scene.Get<component::Health>(ent);
        component::Crate *pCrate = scene.Get<component::Crate>(ent);

        if (pCrate != nullptr)
        {
            component::Children *pChildren = scene.Get<component::Children>(ent);
            component::Color *pColor = scene.DirtyGet<component::Color>(pChildren->children.front());

            double t = (double)pHealth->health / (double)pHealth->max_health;

            pColor->r = Utils::lerp(pColor->r, Utils::lerp(250, 35, t), Game::ANIMATION_SPEED * dt);
            pColor->g = Utils::lerp(pColor->g, Utils::lerp(83, 142, t), Game::ANIMATION_SPEED * dt);
            pColor->b = Utils::lerp(pColor->b, Utils::lerp(41, 249, t), Game::ANIMATION_SPEED * dt);
        }

        component::User *pUser = scene.Get<component::User>(ent);
        if (pUser != nullptr)
        {
            component::Children *pChildren = scene.Get<component::Children>(ent);
            component::Arc *pArc = scene.DirtyGet<component::Arc>(pChildren->children[2]);

            double t = (double)pHealth->health / (double)pHealth->max_health;
            pArc->start_angle = Utils::lerp(pArc->start_angle, Utils::lerp(3 * M_PI_2 * 0.95, M_PI_2 * 1.05, t), Game::ANIMATION_SPEED * dt);
            pArc->end_angle = 3 * M_PI_2 * 0.95;
        }
    }
}

void CameraFollowSystem(Scene &scene)
{
    const double MOVEMENT_SPEED = 10;
    for (EntityID cam : SceneView<component::Camera, component::Transform>(scene, true))
    {
        component::Transform *pCamTransform = scene.DirtyGet<component::Transform>(cam);

        component::Transform *pTransform = scene.Get<component::Transform>(clientUser);
        if (pTransform != nullptr)
            pCamTransform->pos = Vec2::lerp(pCamTransform->pos, pTransform->pos, 0.05);
    }
}

void DespawnSystem(Scene &scene, double dt)
{
    for (EntityID ent : SceneView<component::GroundDrop, component::Despawn>(scene))
    {
        component::Despawn *pDespawn = scene.DirtyGet<component::Despawn>(ent);

        pDespawn->time_to_despawn -= dt;
        if (pDespawn->time_to_despawn <= 0)
        {
            scene.Remove<component::GroundDrop>(ent);
            scene.Assign<component::DeathAnimator>(ent, false);
        }
    }
}

void BulletSystem(Scene &scene, double dt)
{
    for (EntityID ent : SceneView<component::Event, component::Collision>(scene, true))
    {
        component::Collision *pCollision = scene.Get<component::Collision>(ent);

        component::Bullet *pBullet = scene.Get<component::Bullet>(pCollision->source);
        if (pBullet == nullptr) continue;

#ifndef SERVER
        component::Rigidbody *pRigidbody = scene.Get<component::Rigidbody>(pCollision->source);
        if (pRigidbody != nullptr) pRigidbody->velocity = Vec2(0, 0);

        component::Transform *pTransform = scene.Get<component::Transform>(pCollision->source);
        if (pTransform != nullptr) pTransform->scale = Vec2(0, 0);
#endif

        component::Health *pHealth = scene.Get<component::Health>(pCollision->target);

        if (pHealth == nullptr)
        {
#ifdef SERVER
            Utils::destroyEntity(scene, pCollision->source);
#endif
            continue;
        }

        pHealth->health = std::max(pHealth->health - pBullet->damage, 0);
        scene.DirtyGet<component::Health>(pCollision->target);

        if (pHealth->health > 0)
        {
#ifdef SERVER
            Utils::destroyEntity(scene, pCollision->source);
#endif
            continue;
        }

        // Hit player
        if (scene.Get<component::User>(pCollision->target) != nullptr)
        {
#ifdef SERVER
            component::Children *pChildren = scene.Get<component::Children>(pCollision->target);
            scene.Remove<component::Collider>(pChildren->children[0]);
            scene.Assign<component::DeathAnimator>(pCollision->target, false);
#endif
            std::cout << pBullet->owner << " Killed " << pCollision->target << std::endl;
            component::User *pOwner = scene.DirtyGet<component::User>(pBullet->owner);

            if (pOwner != nullptr)
            {
                pOwner->score += Game::PLAYER_KILL_SCORE;
                pOwner->kills++;
            }
        }

        // Hit component::Crate
        if (scene.Get<component::Crate>(pCollision->target) != nullptr)
        {
#ifdef SERVER
            component::ObjectToWorld *pObjectToWorld = scene.Get<component::ObjectToWorld>(pCollision->target);
            EntityID drop = prefab::GroundDrop(scene, ROOT_ENTITY, pObjectToWorld->matrix.get_translation());
            Utils::setSiblingIndex(scene, drop, 0);

            int weapon = Utils::randInt(0, 2);
            switch (weapon)
            {
                case 0:
                    prefab::AssultRifle(scene, drop);
                    break;
                case 1:
                    prefab::Smg(scene, drop);
                    break;
                case 2:
                    prefab::Sniper(scene, drop);
                    break;
                default:
                    break;
            }

            component::Children *pChildren = scene.Get<component::Children>(pCollision->target);
            scene.Remove<component::Crate>(pCollision->target);
            scene.Remove<component::Collider>(pChildren->children[0]);
            scene.Assign<component::DeathAnimator>(pCollision->target, false);
#endif

            component::User *pOwner = scene.DirtyGet<component::User>(pBullet->owner);

            if (pOwner != nullptr)
            {
                pOwner->score += Game::CRATE_KILL_SCORE;
            }
#ifdef SERVER
            Game::spawnEntityRand(scene, ROOT_ENTITY, Game::Spawn::crate, 1);
#endif
        }
#ifdef SERVER
        Utils::destroyEntity(scene, pCollision->source);
#endif
    }

#ifdef SERVER
    for (EntityID ent : SceneView<component::Bullet>(scene))
    {
        component::Bullet *pBullet = scene.Get<component::Bullet>(ent);
        component::Transform *pTransform = scene.Get<component::Transform>(ent);

        if (pTransform->pos.sqr_dist(pBullet->startPos) > pBullet->maxDistance * pBullet->maxDistance)
        {
            scene.Assign<component::DeathAnimator>(ent, false);
        }
    }

    for (EntityID ent : SceneView<component::WeaponReload, component::Weapon>(scene))
    {
        component::Weapon *pWeapon = scene.Get<component::Weapon>(ent);
        component::WeaponReload *pWeaponReload = scene.Get<component::WeaponReload>(ent);
        pWeaponReload->reload_elapsed_time += dt;

        if (pWeaponReload->reload_elapsed_time >= pWeapon->reload_time)
            scene.Remove<component::WeaponReload>(ent);
    }
#endif
}

void ClientNetworkingSystem(Scene &scene)
{
    int packetPos = 0;

    EntityID newUser = INVALID_ENTITY;
    while (packetPos < inBuffer.size())
    {
        EntityID ent = reinterpret_cast<EntityID &>(inBuffer[packetPos]);
        packetPos += sizeof(EntityID);
        ComponentID comp = reinterpret_cast<ComponentID &>(inBuffer[packetPos]);
        packetPos += sizeof(ComponentID);

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
                {
                    scene.NewEntity(ent);
                }
                else
                {
                    component::assignComponent(scene, ent, comp);
                }
                break;
            }
            case NetworkOp::modify:
            {
                if (comp == GetId<component::Polygon>())
                {
                    int size = reinterpret_cast<int &>(inBuffer[packetPos]);
                    packetPos += sizeof(int);

                    component::Polygon *pPolygon = scene.DirtyGet<component::Polygon>(ent);

                    pPolygon->verticies.resize(size);

                    for (int i = 0; i < size; i++)
                        pPolygon->verticies[i] = reinterpret_cast<Vec2 *>(&inBuffer[packetPos])[i];

                    packetPos += size * sizeof(Vec2);
                    continue;
                }

                if (comp == GetId<component::Children>())
                {
                    int size = reinterpret_cast<int &>(inBuffer[packetPos]);
                    packetPos += sizeof(int);

                    component::Children *pChildren = scene.DirtyGet<component::Children>(ent);

                    std::vector<EntityID> clientEntities;
                    for (EntityID child : pChildren->children)
                    {
                        if (IsClientEntity(child))
                            clientEntities.push_back(child);
                    }

                    pChildren->children.resize(size + clientEntities.size());

                    for (int i = 0; i < size; i++)
                        pChildren->children[i] = reinterpret_cast<EntityID *>(&inBuffer[packetPos])[i];

                    for (int i = 0; i < clientEntities.size(); i++)
                        pChildren->children[size + i] = clientEntities[i];

                    packetPos += size * sizeof(EntityID);
                    continue;
                }

                int compSize = scene.GetComponentSize(comp);
                packetPos += compSize;

                uint8_t *compData = reinterpret_cast<uint8_t *>(scene.DirtyGet(ent, comp));
                if (compData == nullptr) break;

                for (int i = 0; i < compSize; i++) compData[i] = inBuffer[packetPos - compSize + i];

                if (comp == GetId<component::User>())
                {
                    if (ent == clientUser)
                    {
                        component::User *pUser = scene.Get<component::User>(ent);

                        EM_ASM({if (Module.onScoreChange) Module.onScoreChange($0); }, pUser->score);
                        EM_ASM({if (Module.onKillsChange) Module.onKillsChange($0); }, pUser->kills);
                    }
                }

                if (comp == GetId<component::Health>() && ent == clientUser)
                {
                    if (ent == clientUser)
                    {
                        component::Health *pHealth = scene.Get<component::Health>(ent);

                        EM_ASM({if (Module.onScoreChange) Module.onHealthChange($0); }, pHealth->health);
                        EM_ASM({if (Module.onKillsChange) Module.onMaxHealthChange($0); }, pHealth->max_health);
                    }
                }

                if (comp == GetId<component::Weapon>())
                {
                    component::Parent *pParent = scene.Get<component::Parent>(ent);
                    if (pParent == nullptr) break;

                    pParent = scene.Get<component::Parent>(pParent->parent);

                    if (pParent != nullptr && pParent->parent == clientUser)
                    {
                        component::Weapon *pWeapon = scene.Get<component::Weapon>(ent);

                        EM_ASM({if (Module.onAmmoChange) Module.onAmmoChange($0); }, pWeapon->ammo);
                        EM_ASM({if (Module.onMaxAmmoChange) Module.onMaxAmmoChange($0); }, pWeapon->max_ammo);
                    }
                }
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
        if (clientUser == INVALID_ENTITY)
        {
            // component::Camera
            EntityID camera = scene.NewEntity(true);

            component::Transform *pTransform = Utils::assignTransform(scene, camera);
            pTransform->scale = Vec2(30, 30);

            scene.Assign<component::Camera>(camera);
        }

        clientUser = newUser;
    }

    inBuffer.clear();

    sendBuffer(outBuffer);
    outBuffer.clear();
}

void InsertComponentData(std::vector<uint8_t> &buffer, EntityID ent, ComponentID comp)
{
    uint8_t *componentData = reinterpret_cast<uint8_t *>(scene.Get(ent, comp));
    if (componentData == nullptr) return;

    bufferInsert<EntityID>(buffer, ent);
    bufferInsert<ComponentID>(buffer, comp | (NetworkOp::modify << 30));

    if (comp == GetId<component::Polygon>())
    {
        component::Polygon *pPolygon = scene.Get<component::Polygon>(ent);
        bufferInsert<int>(buffer, pPolygon->verticies.size());
        for (int i = 0; i < pPolygon->verticies.size(); i++) bufferInsert<Vec2>(buffer, pPolygon->verticies[i]);
        return;
    }

    if (comp == GetId<component::Children>())
    {
        component::Children *pChildren = scene.Get<component::Children>(ent);
        bufferInsert<int>(buffer, pChildren->children.size());
        for (int i = 0; i < pChildren->children.size(); i++) bufferInsert<EntityID>(buffer, pChildren->children[i]);
        return;
    }

    for (int i = 0; i < scene.GetComponentSize(comp); i++) buffer.push_back(componentData[i]);
}

void ServerNetworkingSystem(Scene &scene)
{
    for (ComponentID comp = 1; comp < component::MAX_COMPONENT + 1; comp++)
    {
        for (EntityID ent : SceneView<>(scene))
        {
            if (scene.Get(ent, comp) == nullptr || !scene.IsDirty(ent, comp) || !scene.IsSendingUpdates(ent, comp)) continue;

            InsertComponentData(outBuffer, ent, comp);
            scene.SetClean(ent, comp);
        }
    }

    for (EntityID ent : SceneView<component::User>(scene))
    {
        reinterpret_cast<EntityID &>(outBuffer[0]) = ent;
        sendBuffer(outBuffer);
    }

    outBuffer.clear();
    bufferInsert<EntityID>(outBuffer, INVALID_ENTITY);

    // Handle client actions
    int packetPos = 0;
    while (packetPos < inBuffer.size())
    {
        EntityID user = reinterpret_cast<EntityID &>(inBuffer[packetPos]);
        packetPos += sizeof(EntityID);

        uint32_t size = reinterpret_cast<uint32_t &>(inBuffer[packetPos]);
        packetPos += sizeof(uint32_t);

        if (scene.Get<component::User>(user) == nullptr)
        {
            packetPos += size;
            size = 0;
        }

        while (size > 0)
        {
            size--;
            switch ((Action)inBuffer[packetPos++])
            {
                case Action::forward:
                {
                    component::Rigidbody *pRigidbody = scene.DirtyGet<component::Rigidbody>(user);
                    if (pRigidbody == nullptr) break;
                    pRigidbody->velocity.y = Utils::clamp(pRigidbody->velocity.y - Game::MOVEMENT_SPEED, -Game::MOVEMENT_SPEED, Game::MOVEMENT_SPEED);
                    break;
                }
                case Action::backward:
                {
                    component::Rigidbody *pRigidbody = scene.DirtyGet<component::Rigidbody>(user);
                    if (pRigidbody == nullptr) break;
                    pRigidbody->velocity.y = Utils::clamp(pRigidbody->velocity.y + Game::MOVEMENT_SPEED, -Game::MOVEMENT_SPEED, Game::MOVEMENT_SPEED);
                    break;
                }
                case Action::left:
                {
                    component::Rigidbody *pRigidbody = scene.DirtyGet<component::Rigidbody>(user);
                    if (pRigidbody == nullptr) break;
                    pRigidbody->velocity.x = Utils::clamp(pRigidbody->velocity.x - Game::MOVEMENT_SPEED, -Game::MOVEMENT_SPEED, Game::MOVEMENT_SPEED);
                    break;
                }
                case Action::right:
                {
                    component::Rigidbody *pRigidbody = scene.DirtyGet<component::Rigidbody>(user);
                    if (pRigidbody == nullptr) break;
                    pRigidbody->velocity.x = Utils::clamp(pRigidbody->velocity.x + Game::MOVEMENT_SPEED, -Game::MOVEMENT_SPEED, Game::MOVEMENT_SPEED);
                    break;
                }
                case Action::interact:
                {
                    EntityID closest_drop = findClosestDrop(user);
                    if (closest_drop == INVALID_ENTITY) break;
                    pickupDrop(user, closest_drop);
                    break;
                }
                case Action::fire:
                {
                    EntityID weapon = getPlayerWeapon(user);
                    if (scene.Get<component::WeaponReload>(weapon) == nullptr)
                    {
                        component::Weapon *pWeapon = scene.Get<component::Weapon>(weapon);
                        if (pWeapon->ammo == 0) break;

                        component::Children *pChildren = scene.Get<component::Children>(weapon);
                        component::ObjectToWorld *pObjectToWorld = scene.Get<component::ObjectToWorld>(pChildren->children.back());

                        // Spawn bullet
                        double rotation = pObjectToWorld->matrix.get_rotation();
                        EntityID bullet = prefab::Bullet(scene, ROOT_ENTITY, pObjectToWorld->matrix.get_translation(), rotation);
                        component::Bullet *pBullet = scene.DirtyGet<component::Bullet>(bullet);
                        pBullet->owner = user;
                        pBullet->maxDistance = pWeapon->range;
                        pBullet->damage = pWeapon->damage;

                        component::Rigidbody *pRigidbody = scene.DirtyGet<component::Rigidbody>(bullet);
                        pRigidbody->velocity = Vec2::from_angle(rotation) * pWeapon->bulletSpeed;

                        // Update weapon
                        scene.Assign<component::WeaponReload>(weapon);
                        scene.DirtyGet<component::Weapon>(weapon);
                        pWeapon->ammo--;
                    }
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

                    component::Transform *pTransform = scene.DirtyGet<component::Transform>(user);
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
    EntityID user = CreateEntityId(index, version);
    std::cout << "Disconnected, UserId: " << user << std::endl;

    if (scene.Get<component::User>(user) != nullptr)
    {
        component::Children *pChildren = scene.Get<component::Children>(user);
        scene.Remove<component::Collider>(pChildren->children[0]);
        scene.Remove<component::User>(user);
        scene.Assign<component::DeathAnimator>(user, false);
    }
}

uint32_t onUserConnect()
{
    EntityID *user = new EntityID;
    *user = Game::spawnPlayerRand(scene);
    std::cout << "Connected, UserId: " << *user << std::endl;
    return reinterpret_cast<uint32_t>(user);
}

void stateSync(uint32_t buffer)
{
    EntityID *user = reinterpret_cast<EntityID *>(buffer);
    std::cout << "Sync start, UserId: " << *user << std::endl;

    tempBuffer.clear();
    bufferInsert<EntityID>(tempBuffer, *user);
    bufferInsert<EntityID>(tempBuffer, *user);
    bufferInsert<ComponentID>(tempBuffer, 0 | (NetworkOp::setUser << 30));

    for (EntityID ent : SceneView<>(scene))
    {
        bufferInsert<EntityID>(tempBuffer, ent);
        bufferInsert<ComponentID>(tempBuffer, 0 | (NetworkOp::create << 30));
    }

    for (ComponentID comp = 1; comp < component::MAX_COMPONENT + 1; comp++)
    {
        for (EntityID ent : SceneView<>(scene))
        {
            if (scene.Get(ent, comp) == nullptr) continue;

            bufferInsert<EntityID>(tempBuffer, ent);
            bufferInsert<ComponentID>(tempBuffer, comp | (NetworkOp::create << 30));

            if (scene.IsSendingUpdates(ent, comp))
                InsertComponentData(tempBuffer, ent, comp);
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
    BulletSystem(scene, dt);
    DespawnSystem(scene, dt);
    DeathAnimatorSystem(scene, dt);
    EventSystem(scene);
    ServerNetworkingSystem(scene);
#endif

#ifndef SERVER
    if (clientUser != INVALID_ENTITY && !connected)
    {
        connected = true;
        EM_ASM({if (Module.onConnect) Module.onConnect(); });
    }

    if (connected && clientUser != INVALID_ENTITY)
    {
        if (scene.Get<component::Health>(clientUser)->health == 0 && !isDead)
        {
            std::cout << "Killed" << std::endl;
            isDead = true;
            EM_ASM({if (Module.onDeath) Module.onDeath(); });
        }

        RigidbodySystem(scene, dt);
        ObjectToWorldSystem(scene);
        CollisionSystem(scene);
        ObjectToWorldSystem(scene);
        BulletSystem(scene, dt);

        if (!isDead)
        {
            PlayerActionsSystem(scene);
            CameraFollowSystem(scene);
        }

        WorldToViewSystem(scene);
        GroundDropSystem(scene, elapsedTime);
        DeathAnimatorSystem(scene, dt);
        HealthSystem(scene, dt);
        EventSystem(scene);
        RenderSystem(scene);
    }

    ClientNetworkingSystem(scene);
#endif
    last_key_state = key_state;
}

void stop()
{
    if (stopped) return;
    stopped = true;

#ifdef SERVER
    EM_ASM({
        clearTimeout(Module.loop);
        clearInterval(Module.interval);
        if (Module.socket)
            Module.socket.terminate();
    });
#endif
#ifndef SERVER
    EM_ASM({
        cancelAnimationFrame(Module.loop);
        if (Module.canvas)
        {
            Module.canvas.onmousedown = function(){};
            Module.canvas.onmouseup = function(){};
            Module.canvas.onmousemove = function(){};
            Module.canvas.onkeydown = function(){};
            Module.canvas.onkeyup = function(){};
        }

        if (Module.socket)
        {
            Module.socket.close();
        }
    });
#endif

    EM_ASM({if (Module.onStop) Module.onStop(); });
}

void start()
{
    if (!stopped) stop();

    // Reset
    scene = Scene();
    elapsedTime = 0;
    key_state = {0};
    last_key_state = {0};
    mouse_pos = Vec2(0, 0);
    screen_size = Vec2(0, 0);
    tempBuffer.clear();
    inBuffer.clear();
    outBuffer.clear();
    clientUser = INVALID_ENTITY;
    isDead = false;
    connected = false;
    stopped = false;

#ifndef SERVER
    EM_ASM({
        let keyMap = ({'w' : 0, 's' : 1, 'a' : 2, 'd' : 3, 'e' : 4});

        Module.canvas = document.getElementById('canvas');
        Module.context = Module.canvas.getContext('2d');
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

        console.log('Connecting ws://' + window.location.hostname + ':' + $0);

        // Setup Websocket
        Module.socket = new WebSocket('ws://' + window.location.hostname + ':' + $0);
        Module.socket.binaryType = 'arraybuffer';

        Module.socket.onclose = function(event)
        {
            Module.stop();
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
    bufferInsert<EntityID>(outBuffer, INVALID_ENTITY);
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

                let user = Module.onUserConnect();
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
    EntityID root = scene.NewEntity();
    assert(root == ROOT_ENTITY);

    scene.Assign<component::Transform>(ROOT_ENTITY);
    scene.Assign<component::ObjectToWorld>(ROOT_ENTITY, false);
    scene.Assign<component::Children>(ROOT_ENTITY);
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
    function("update", &update);
    function("onMouseDown", &onMouseDown);
    function("onMouseMove", &onMouseMove);
    function("onMouseUp", &onMouseUp);
    function("onKeyDown", &onKeyDown);
    function("onKeyUp", &onKeyUp);
    function("onPacket", &onPacket);
    function("onUserConnect", &onUserConnect);
    function("stateSync", &stateSync);
    function("onDisconnect", &onDisconnect);
    function("start", &start);
    function("stop", &stop);
}