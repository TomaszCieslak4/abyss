#ifndef TEST_H
#define TEST_H

#include <vector>
#include <iostream>
#include <bitset>

#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "./vector.cpp"
#include "./matrix.cpp"
#include "./components.cpp"
#include "./sat.cpp"
#include "./scene.cpp"
#include "./game.cpp"

// #define SERVER

using namespace emscripten;

constexpr int PORT = 25567;

enum Controls
{
    forward,
    backward,
    left,
    right,
    interact,
    fire,
    MAX = fire
};

enum NetworkOp
{
    modify,
    create,
    destroy,
};

struct Packet
{
    int size;
    char *buffer;
};

Scene scene;
double elapsedTime;
std::bitset<Controls::MAX + 1> key_state;
std::bitset<Controls::MAX + 1> last_key_state;
Vec2 mouse_pos;
Vec2 screen_size;
std::vector<Packet> packets;

void calculateMatrix(Scene &scene, EntityID ent)
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
    for (EntityID ent : pChildren->children)
    {
        calculateMatrix(scene, ent);
    }
}

void ObjectToWorldSystem(Scene &scene)
{
    Children *pChildren = scene.Get<Children>(ROOT_ENTITY);

    for (EntityID ent : pChildren->children)
    {
        calculateMatrix(scene, ent);
    }
}

void WorldToViewSystem(Scene &scene)
{
    Mat3 identity = Mat3::identity();

    for (EntityID ent : SceneView<Transform, Camera>(scene))
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

void renderEntity(Scene &scene, EntityID ent, Mat3 &view_matrix)
{
    Color *pColor = scene.Get<Color>(ent);
    ObjectToWorld *pObjectToWorld = scene.Get<ObjectToWorld>(ent);

    if (pColor != nullptr && pObjectToWorld != nullptr)
    {
        Mat3 object_to_view = view_matrix * pObjectToWorld->matrix;
        Outline *pOutline = scene.Get<Outline>(ent);

        // Rect *pRect = scene.Get<Rect>(ent);

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

    for (EntityID ent : pChildren->children)
    {
        renderEntity(scene, ent, view_matrix);
    }
}

void RenderSystem(Scene &scene)
{
    Children *pChildren = scene.Get<Children>(ROOT_ENTITY);

    for (EntityID cam : SceneView<Camera>(scene))
    {
        Camera *pCamera = scene.Get<Camera>(cam);

        for (EntityID ent : pChildren->children)
        {
            renderEntity(scene, ent, pCamera->world_to_view);
        }
    }
}

void checkCollisionHelper(Scene &scene, EntityID ent, EntityID other, EntityID topEnt, EntityID otherTopEnt)
{
    if (scene.Get<Collider>(ent) != nullptr)
    {
        Vec2 mtv;

        if (sat(scene, ent, other, mtv))
        {
            EntityID collisionEvent = scene.NewEntity();
            scene.Assign<Event>(collisionEvent);
            Collision *pCollision = scene.Assign<Collision>(collisionEvent);
            pCollision->source = topEnt;
            pCollision->target = otherTopEnt;
            pCollision->mtv = mtv;
        }
    }

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return;
    for (EntityID ent : pChildren->children)
    {
        checkCollisionHelper(scene, ent, other, topEnt, otherTopEnt);
    }
}

void checkCollision(Scene &scene, EntityID ent, EntityID topEnt)
{
    Children *pRootChildren = scene.Get<Children>(ROOT_ENTITY);

    if (scene.Get<Collider>(ent) != nullptr)
    {
        for (EntityID rootEnt : pRootChildren->children)
        {
            if (topEnt == rootEnt) continue;
            checkCollisionHelper(scene, rootEnt, ent, topEnt, rootEnt);
        }
    }

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return;
    for (EntityID ent : pChildren->children)
    {
        checkCollision(scene, ent, topEnt);
    }
}

void RigidbodySystem(Scene &scene, double dt)
{
    for (EntityID ent : SceneView<Rigidbody, Transform>(scene))
    {
        Transform *pTransform = scene.Get<Transform>(ent);
        Rigidbody *pRigidbody = scene.Get<Rigidbody>(ent);
        pTransform->pos = pTransform->pos + pRigidbody->velocity * dt;
    }
}

void CollisionSystem(Scene &scene)
{
    // Generate Collisions
    for (EntityID ent : SceneView<ObjectToWorld, Rigidbody, Transform>(scene))
    {
        checkCollision(scene, ent, ent);
    }

    // Resolve Collisions
    for (EntityID ent : SceneView<Collision, Event>(scene))
    {
        Collision *pCollision = scene.Get<Collision>(ent);
        Transform *pTransform = scene.Get<Transform>(pCollision->source);
        pTransform->pos = pTransform->pos + pCollision->mtv;
    }
}

void EventSystem(Scene &scene)
{
    for (EntityID ent : SceneView<Event>(scene))
    {
        scene.DestroyEntity(ent);
    }
}

void GroundDropSystem(Scene &scene, double elapsedTime)
{
    for (EntityID ent : SceneView<GroundDrop>(scene))
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

void PlayerMovementSystem(Scene &scene)
{
    const double MOVEMENT_SPEED = 10;
    for (EntityID ent : SceneView<User, Rigidbody, Transform>(scene))
    {
        Rigidbody *pRigidbody = scene.Get<Rigidbody>(ent);

        pRigidbody->velocity.y = 0;
        pRigidbody->velocity.x = 0;
        if (key_state.test(Controls::forward))
        {
            pRigidbody->velocity.y += MOVEMENT_SPEED;
        }
        if (key_state.test(Controls::backward))
        {
            pRigidbody->velocity.y -= MOVEMENT_SPEED;
        }
        if (key_state.test(Controls::left))
        {
            pRigidbody->velocity.x -= MOVEMENT_SPEED;
        }
        if (key_state.test(Controls::right))
        {
            pRigidbody->velocity.x += MOVEMENT_SPEED;
        }

        for (EntityID cam : SceneView<Camera, ObjectToWorld>(scene))
        {
            ObjectToWorld *pObjectToWorld = scene.Get<ObjectToWorld>(cam);

            double size = std::min(screen_size.x, screen_size.y);
            Vec2 world_pos = pObjectToWorld->matrix * ((mouse_pos - screen_size / 2) / size);
            Transform *pTransform = scene.Get<Transform>(ent);
            pTransform->rotation = (world_pos - pTransform->pos).get_angle();
        }
    }
}

void InteractSystem(Scene &scene)
{
    const double INTERACT_RANGE = 2.7;

    for (EntityID usr : SceneView<User, Children, Transform, Health>(scene))
    {
        Transform *pUsrTransform = scene.Get<Transform>(usr);
        double min_dist = INFINITY;
        EntityID closest_drop = INVALID_ENTITY;

        for (EntityID ent : SceneView<GroundDrop, Transform>(scene))
        {
            Transform *pTransform = scene.Get<Transform>(ent);

            double sqr_dist = pUsrTransform->pos.sqr_dist(pTransform->pos);
            if (sqr_dist < min_dist && sqr_dist < INTERACT_RANGE * INTERACT_RANGE)
            {
                min_dist = sqr_dist;
                closest_drop = ent;
            }
        }

        if (closest_drop == INVALID_ENTITY) continue;

        // PICKUP
        if (!(!last_key_state.test(Controls::interact) && key_state.test(Controls::interact))) continue;

        HealthPack *pHealthPack = scene.Get<HealthPack>(closest_drop);
        if (pHealthPack != nullptr)
        {
            Health *pHealth = scene.Get<Health>(usr);
            pHealth->health = pHealth->max_health;
            scene.Remove<GroundDrop>(closest_drop);
            scene.Assign<DeathAnimator>(closest_drop);
            continue;
        }

        AmmoPack *pAmmoPack = scene.Get<AmmoPack>(closest_drop);
        if (pAmmoPack != nullptr)
        {
            Children *pChildren = scene.Get<Children>(usr);
            EntityID spawnpoint = pChildren->children.back();
            Children *pSpawnpointChildren = scene.Get<Children>(spawnpoint);

            Weapon *pWeapon = scene.Get<Weapon>(pSpawnpointChildren->children[0]);
            pWeapon->ammo = pWeapon->max_ammo;

            scene.Remove<GroundDrop>(closest_drop);
            scene.Assign<DeathAnimator>(closest_drop);
            continue;
        }

        Children *pChildren = scene.Get<Children>(closest_drop);
        EntityID drop = pChildren->children.back();
        Weapon *pWeapon = scene.Get<Weapon>(drop);

        if (pWeapon != nullptr)
        {
            Children *pChildren = scene.Get<Children>(usr);
            EntityID spawnpoint = pChildren->children.back();
            Children *pSpawnpointChildren = scene.Get<Children>(spawnpoint);

            setParent(scene, drop, spawnpoint);
            Transform *pTransform = scene.Get<Transform>(drop);
            pTransform->pos = Vec2::zero();

            if (pSpawnpointChildren->children.size() > 0)
            {
                EntityID oldWeapon = pSpawnpointChildren->children[0];
                setParent(scene, oldWeapon, closest_drop);
                Transform *pTransform = scene.Get<Transform>(oldWeapon);
                pTransform->pos = Vec2::zero();
                pTransform->rotation = 0;
                Despawn *pDespawn = scene.Assign<Despawn>(closest_drop);
                pDespawn->time_to_despawn = 10;
                continue;
            }

            scene.Remove<GroundDrop>(closest_drop);
            scene.Assign<DeathAnimator>(closest_drop);
            continue;
        }
    }
}

void DeathAnimatorSystem(Scene &scene, double dt)
{
    for (EntityID ent : SceneView<DeathAnimator>(scene))
    {
        Transform *pTransform = scene.Get<Transform>(ent);

        pTransform->scale = Vec2::lerp(pTransform->scale, Vec2::zero(), 10 * dt);
        if (pTransform->scale.sqr_magnitude() <= 0.01)
        {
            destroyEntity(scene, ent);
        }
    }
}

void HealthSystem(Scene &scene)
{
    for (EntityID ent : SceneView<Health>(scene))
    {
        Health *pHealth = scene.Get<Health>(ent);
        Crate *pCrate = scene.Get<Crate>(ent);

        if (pCrate != nullptr)
        {
            Children *pChildren = scene.Get<Children>(ent);
            Color *pColor = scene.Get<Color>(pChildren->children.front());

            double t = (double)pHealth->health / (double)pHealth->max_health;
            pColor->r = lerp(250, 35, t);
            pColor->g = lerp(83, 142, t);
            pColor->b = lerp(41, 249, t);
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
            pArc->start_angle = lerp(3 * M_PI_2 * 0.95, M_PI_2 * 1.05, t);
        }
    }
}

void CameraFollowSystem(Scene &scene)
{
    const double MOVEMENT_SPEED = 10;
    for (EntityID cam : SceneView<Camera, Transform>(scene))
    {
        Transform *pCamTransform = scene.Get<Transform>(cam);

        for (EntityID ent : SceneView<User, Transform>(scene))
        {
            Transform *pTransform = scene.Get<Transform>(ent);
            pCamTransform->pos = Vec2::lerp(pCamTransform->pos, pTransform->pos, 0.05);
        }
    }
}

void DespawnSystem(Scene &scene, double dt)
{
    for (EntityID ent : SceneView<GroundDrop, Despawn>(scene))
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

void NetworkingClientSystem(Scene &scene, std::vector<Packet> &packets)
{
    for (int i = 0; i < packets.size(); i++)
    {
        char *packet = packets[i].buffer;

        EntityID ent = *reinterpret_cast<EntityID *>(packet);
        ComponentID comp = *reinterpret_cast<ComponentID *>(packet + sizeof(EntityID));

        NetworkOp op = (NetworkOp)(comp >> 30);
        comp = comp & (~0 >> 2);

        switch (op)
        {
            case NetworkOp::create:
            {
                std::cout << "HERE create" << std::endl;
                // Entity
                // REMINDER: include new case for new components
                if (comp == 0)
                    scene.NewEntity();
                else if (comp == GetId<Transform>())
                    scene.Assign<Transform>(ent);
                else if (comp == GetId<ObjectToWorld>())
                    scene.Assign<ObjectToWorld>(ent);
                else if (comp == GetId<Parent>())
                    scene.Assign<Parent>(ent);
                else if (comp == GetId<Despawn>())
                    scene.Assign<Despawn>(ent);
                else if (comp == GetId<Children>())
                    scene.Assign<Children>(ent);
                else if (comp == GetId<Collider>())
                    scene.Assign<Collider>(ent);
                else if (comp == GetId<Rigidbody>())
                    scene.Assign<Rigidbody>(ent);
                else if (comp == GetId<Collision>())
                    scene.Assign<Collision>(ent);
                else if (comp == GetId<GroundDrop>())
                    scene.Assign<GroundDrop>(ent);
                else if (comp == GetId<Event>())
                    scene.Assign<Event>(ent);
                else if (comp == GetId<Camera>())
                    scene.Assign<Camera>(ent);
                else if (comp == GetId<User>())
                    scene.Assign<User>(ent);
                else if (comp == GetId<HealthPack>())
                    scene.Assign<HealthPack>(ent);
                else if (comp == GetId<AmmoPack>())
                    scene.Assign<AmmoPack>(ent);
                else if (comp == GetId<DeathAnimator>())
                    scene.Assign<DeathAnimator>(ent);
                else if (comp == GetId<Health>())
                    scene.Assign<Health>(ent);
                else if (comp == GetId<Weapon>())
                    scene.Assign<Weapon>(ent);
                else if (comp == GetId<Bullet>())
                    scene.Assign<Bullet>(ent);
                else if (comp == GetId<AI>())
                    scene.Assign<AI>(ent);
                else if (comp == GetId<Crate>())
                    scene.Assign<Crate>(ent);
                else if (comp == GetId<Color>())
                    scene.Assign<Color>(ent);
                else if (comp == GetId<Outline>())
                    scene.Assign<Outline>(ent);
                else if (comp == GetId<Renderer>())
                    scene.Assign<Renderer>(ent);
                else if (comp == GetId<Arc>())
                    scene.Assign<Arc>(ent);
                else if (comp == GetId<Polygon>())
                    scene.Assign<Polygon>(ent);
                break;
            }
            case NetworkOp::modify:
            {
                int headerSize = sizeof(EntityID) + sizeof(ComponentID);
                char *compData = reinterpret_cast<char *>(scene.GetByID(ent, comp));
                if (compData == nullptr) break;
                for (int i = 0; i < packets[i].size - headerSize; i++) compData[i] = (packet + headerSize)[i];
                break;
            }
            case NetworkOp::destroy:
            {
                std::cout << "HERE delete" << std::endl;
                if (comp == 0)
                {
                    scene.DestroyEntity(ent);
                }
                else
                {
                    scene.RemoveById(ent, comp);
                }
                break;
            }
        }

        delete[] packet;
    }

    packets.clear();
}

void sendPackets(std::vector<Packet> &packets)
{
    EM_ASM({
        let packets = new Uint8Array(Module.HEAPU8.buffer, $0, $1 * 16);
        for (let i = 0; i < $1; i++)
        {
            Module.broadcast(packets.slice(i * 16, (i + 1) * 16));
        }
    },
           packets.data(), packets.size());
}

void NetworkingServerSystem(Scene &scene, std::vector<Packet> &packets)
{
    for (ComponentID comp = 1; comp < s_componentCounter; comp++)
    {
        for (EntityID ent : SceneView<>(scene))
        {
            char *componentData = reinterpret_cast<char *>(scene.GetByID(ent, comp));
            if (componentData == nullptr) continue;

            // TODO:: HANDLE VECTORS, POLYGON and CHILDREN
            if (comp == GetId<Polygon>() || comp == GetId<Children>()) continue;

            int size = scene.GetComponentSize(comp);
            // std::cout << size << std::endl;
            int headerSize = sizeof(EntityID) + sizeof(ComponentID);

            char *buffer = new char[headerSize + size];
            // char *buffer = nullptr;
            *reinterpret_cast<EntityID *>(buffer) = ent;
            *reinterpret_cast<ComponentID *>(buffer + sizeof(EntityID)) = comp | (NetworkOp::modify << 30);
            for (int i = headerSize; i < size; i++) buffer[i] = componentData[i];
            packets.push_back({headerSize + size, buffer});
        }
    }

    sendPackets(packets);

    for (int i = 0; i < packets.size(); i++)
    {
        delete[] packets[i].buffer;
    }
    packets.clear();
}

void onMouseDown(int x, int y, int button)
{
    if (button == 0)
        key_state.set(Controls::fire);
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
        key_state.reset(Controls::fire);
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

void onPacket(int pPacket, int size)
{
    packets.push_back({size, reinterpret_cast<char *>(pPacket)});
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
    // RigidbodySystem(scene, dt);
    // ObjectToWorldSystem(scene);
    // CollisionSystem(scene);
    // ObjectToWorldSystem(scene);
    // DespawnSystem(scene, dt);
    // GroundDropSystem(scene, elapsedTime);
    // InteractSystem(scene);
    // DeathAnimatorSystem(scene, dt);
    // HealthSystem(scene);
    // EventSystem(scene);
    NetworkingServerSystem(scene, packets);
#endif

#ifndef SERVER
    // PlayerMovementSystem(scene);
    // CameraFollowSystem(scene);
    // WorldToViewSystem(scene);
    // RenderSystem(scene);
    NetworkingClientSystem(scene, packets);
#endif

    // for (EntityID ent : SceneView<Camera, Transform>(scene))
    // {
    //     // Children *pChildren = scene.Get<Children>(ent);
    //     // pChildren->children[0]
    //     Transform *pTransform = scene.Get<Transform>(ent);

    //     // Do stuff
    //     // pHealth->health = std::max(0, pHealth->health - 1);
    //     pTransform->rotation = pTransform->rotation + dt * 1;
    // }
    last_key_state = key_state;
}

int main(int argc, char *argv[])
{
#ifndef SERVER
    EM_ASM({
        Module.canvas = document.getElementById('canvas');
        Module.context = Module.canvas.getContext('2d');

        let keyMap = ({'w' : 1, 's' : 0, 'a' : 2, 'd' : 3, 'e' : 4});

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

        let request = 0;
        let lastTime = performance.now();

        function update(timestamp)
        {
            let dt = Math.min((timestamp - lastTime) / 1000, 1 / 60);
            lastTime = timestamp;
            Module.update(dt);
            request = window.requestAnimationFrame(update);
        }

        request = window.requestAnimationFrame(update);

        // SETUP WEBSOCKET
        console.log('attempting connection to ws://' + window.location.hostname + ':' + $0);

        Module.socket = new WebSocket('ws://' + window.location.hostname + ':' + $0);
        Module.socket.binaryType = 'arraybuffer';

        Module.socket.onclose = function(event)
        {
            console.log('closed code:' + event.code + ' reason:' + event.reason + ' wasClean:' + event.wasClean);
        };
        Module.socket.onmessage = function(event)
        {
            // console.log(event.data);
            let array = new Uint8Array(event.data);
            let pPacket = Module._malloc(array.length);
            Module.HEAPU8.set(array, pPacket);
            Module.onPacket(pPacket, array.length);
        };
        Module.socket.onopen = function(event)
        {
            console.log('connected');
            // let array = ([ 10, 20, 30 ]);
            // Module.socket.send(new Int8Array(array));
        };
    },
           PORT);

#endif

#ifdef SERVER
    EM_ASM({
        var Server = require('ws').Server;
        let wss = new Server({port : $0});
        wss.binaryType = 'arraybuffer';

        let messages = [];

        wss.on(
            'close', function() {
                console.log('disconnected');
            });

        wss.on(
            'listening', function() {
                console.log('Start on port ' + $0);
            });

        wss.broadcast = function(message)
        {
            for (let ws of wss.clients)
            {
                ws.send(message);
            }
        };

        Module.broadcast = wss.broadcast;

        wss.on(
            'connection', function(ws) {
                for (let i = 0; i < messages.length; i++)
                {
                    ws.send(messages[i]);
                }
                ws.on(
                    'message', function(message) {
                        ws.send(message);
                        console.log(message);
                    });
            });

        function clock(start)
        {
            if (!start) return process.hrtime();
            var end = process.hrtime(start);
            return Math.round((end[0] * 1000) + (end[1] / 1000000));
        }

        let request = 0;
        let lastTime = clock();

        function update()
        {
            let timestamp = clock();
            let dt = Math.min((timestamp - lastTime) / 1000, 1 / 60);
            lastTime = timestamp;
            Module.update(dt);
            request = setTimeout(update, (1 / 1) * 3000);
        }

        request = setTimeout(update, 0);
    },
           PORT);
#endif

    EntityID root = scene.NewEntity();
    assert(root == ROOT_ENTITY);

    Transform *pTransform = scene.Assign<Transform>(ROOT_ENTITY);
    scene.Assign<ObjectToWorld>(ROOT_ENTITY);
    scene.Assign<Children>(ROOT_ENTITY);
    loadScene(scene);
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
    function("onPacket", &onPacket, allow_raw_pointers());
}

#endif