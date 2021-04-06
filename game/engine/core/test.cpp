
#ifndef TEST_H
#define TEST_H

#include "./components.cpp"
#include "./scene.cpp"
#include "./matrix.cpp"
#include "./vector.cpp"
#include "./game.cpp"
#include <vector>
#include <iostream>
#include <bitset>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

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

Scene scene;
EntityID root;
double elapsedTime;
std::bitset<Controls::MAX + 1> immediate_key_state;
std::bitset<Controls::MAX + 1> key_state;
std::bitset<Controls::MAX + 1> last_key_state;
Vec2 immediate_mouse_pos;
Vec2 mouse_pos;
Vec2 screen_size;

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

void ObjectToWorldSystem(Scene &scene, EntityID root)
{
    Children *pChildren = scene.Get<Children>(root);

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

        Rect *pRect = scene.Get<Rect>(ent);

#ifdef __EMSCRIPTEN__
        EM_ASM({
            window.context.save();
            window.context.setTransform($0, $1, $2, $3, $4, $5);
            window.context.fillStyle = `rgba(${$6}, ${$7}, ${$8}, ${$9})`;
            window.context.beginPath();
        },
               object_to_view.array[0], object_to_view.array[3], object_to_view.array[1], object_to_view.array[4], object_to_view.array[2], object_to_view.array[5], pColor->r, pColor->g, pColor->b, pColor->a);
#endif

        if (pOutline != nullptr)
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                window.context.lineWidth = $0;
                window.context.strokeStyle = `rgba(${$1}, ${$2}, ${$3}, ${$4})`;
                window.context.scale(1 - $0 / 2, 1 - $0 / 2);
            },
                   pOutline->thickness, pColor->r, pColor->g, pColor->b, pColor->a);
#endif
        }

        if (pRect != nullptr)
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                window.context.rect(-0.5, -0.5, 1, 1);
            });
#endif
        }

        Arc *pArcRenderer = scene.Get<Arc>(ent);

        if (pArcRenderer != nullptr)
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                window.context.arc(0, 0, 0.5, $0, $1);
            },
                   pArcRenderer->start_angle, pArcRenderer->end_angle);
#endif
        }

        Triangle *pTriangleRenderer = scene.Get<Triangle>(ent);

        if (pTriangleRenderer != nullptr)
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                window.context.moveTo(0, -0.5);
                window.context.lineTo(0.5, 0.5);
                window.context.lineTo(-0.5, 0.5);
            });
#endif
        }

        if (pOutline != nullptr)
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                window.context.stroke();
                window.context.restore();
            });
#endif
        }
        else
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                window.context.fill();
                window.context.restore();
            });
#endif
        }
    }

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return;

    for (EntityID ent : pChildren->children)
    {
        renderEntity(scene, ent, view_matrix);
    }
}

void RenderSystem(Scene &scene, EntityID root)
{
    Children *pChildren = scene.Get<Children>(root);

    for (EntityID cam : SceneView<Camera>(scene))
    {
        Camera *pCamera = scene.Get<Camera>(cam);

        for (EntityID ent : pChildren->children)
        {
            renderEntity(scene, ent, pCamera->world_to_view);
        }
    }
}

bool circleCircleIntersects(Mat3 &obj1, Mat3 &obj2, Vec2 &mtv)
{
    Vec2 pos1 = obj1.get_translation();
    Vec2 pos2 = obj2.get_translation();
    Vec2 scale1 = obj1.get_scale();
    Vec2 scale2 = obj2.get_scale();

    Vec2 diff = pos2 - pos1;
    double sqr_mag = diff.sqr_magnitude();
    double radius = (scale2.x + scale1.x) / 2;

    if (sqr_mag >= radius * radius) return false;

    mtv = diff * (radius / sqrt(sqr_mag) - 1);
    return true;
}

bool rectCircleIntersects(Mat3 &obj1, Mat3 &obj2, Vec2 &mtv)
{
    Vec2 rectPos = obj1.get_translation();
    Vec2 circlePos = obj2.get_translation();

    Vec2 rectScale = obj1.get_scale();
    rectScale = rectScale / 2;
    double circleRadius = obj2.get_scale().x / 2;

    Vec2 closest = circlePos.clamp(rectPos - rectScale, rectPos + rectScale);
    Vec2 diff = circlePos - closest;
    double sqr_mag = diff.sqr_magnitude();

    if (sqr_mag >= (circleRadius * circleRadius)) return false;
    mtv = diff * ((circleRadius / sqrt(sqr_mag)) - 1);
    return true;
}

void checkCollisionHelper(Scene &scene, EntityID ent, EntityID other, EntityID topEnt, EntityID otherTopEnt)
{
    if (scene.Get<Collider>(ent) != nullptr)
    {
        ObjectToWorld *pObjectToWorld = scene.Get<ObjectToWorld>(ent);
        ObjectToWorld *pOtherObjectToWorld = scene.Get<ObjectToWorld>(other);

        bool colliding = false;
        Vec2 mtv;
        if (scene.Get<Rect>(ent) != nullptr)
        {
            if (scene.Get<Rect>(other) != nullptr)
            {
                // if (sat(genRectVerts(pObjectToWorld->matrix), genRectVerts(pOtherObjectToWorld->matrix)))
                // {
                //     std::cout << "COLLIDING" << std::endl;
                // }
            }
            else if (scene.Get<Arc>(other) != nullptr)
            {
                if (rectCircleIntersects(pObjectToWorld->matrix, pOtherObjectToWorld->matrix, mtv)) colliding = true;
            }
        }
        else if (scene.Get<Arc>(ent) != nullptr)
        {
            if (scene.Get<Rect>(other) != nullptr)
            {
                if (rectCircleIntersects(pOtherObjectToWorld->matrix, pObjectToWorld->matrix, mtv))
                {
                    mtv = mtv * -1;
                    colliding = true;
                }
            }
            if (scene.Get<Arc>(other) != nullptr)
            {
                if (circleCircleIntersects(pObjectToWorld->matrix, pOtherObjectToWorld->matrix, mtv)) colliding = true;
            }
        }

        if (colliding)
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

void checkCollision(Scene &scene, EntityID ent, EntityID topEnt, EntityID root)
{
    Children *pRootChildren = scene.Get<Children>(root);

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
        checkCollision(scene, ent, topEnt, root);
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

void CollisionSystem(Scene &scene, EntityID root)
{
    // Generate Collisions
    for (EntityID ent : SceneView<ObjectToWorld, Rigidbody, Transform>(scene))
    {
        checkCollision(scene, ent, ent, root);
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

extern "C"
{
    void onMouseDown(int x, int y, int button)
    {
        if (button == 0)
            immediate_key_state.set(Controls::fire);
        immediate_mouse_pos.x = x;
        immediate_mouse_pos.y = y;
    }

    void onMouseMove(int x, int y)
    {
        immediate_mouse_pos.x = x;
        immediate_mouse_pos.y = y;
    }

    void onMouseUp(int x, int y, int button)
    {
        if (button == 0)
            immediate_key_state.reset(Controls::fire);
        immediate_mouse_pos.x = x;
        immediate_mouse_pos.y = y;
    }

    void onKeyDown(int key)
    {
        immediate_key_state.set(key);
    }

    void onKeyUp(int key)
    {
        immediate_key_state.reset(key);
    }

    void start()
    {
        root = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(root);
        scene.Assign<Children>(root);
        scene.Assign<ObjectToWorld>(root);
        loadScene(scene, root);
    }

    void update(double dt)
    {
#ifdef __EMSCRIPTEN__
        screen_size.x = EM_ASM_DOUBLE({
            window.canvas.width = window.canvas.clientWidth;
            return window.canvas.width;
        });

        screen_size.y = EM_ASM_DOUBLE({
            window.canvas.height = window.canvas.clientHeight;
            return window.canvas.height;
        });

        EM_ASM({
            let context = window.context;
            context.clearRect(0, 0, $1, $2);
        },
               screen_size.x, screen_size.y);
#endif
        elapsedTime += dt;
        mouse_pos = immediate_mouse_pos;
        key_state = immediate_key_state;

        RigidbodySystem(scene, dt);
        ObjectToWorldSystem(scene, root);
        CollisionSystem(scene, root);
        ObjectToWorldSystem(scene, root);

        PlayerMovementSystem(scene);
        DespawnSystem(scene, dt);
        GroundDropSystem(scene, elapsedTime);
        InteractSystem(scene);
        DeathAnimatorSystem(scene, dt);

        CameraFollowSystem(scene);
        WorldToViewSystem(scene);
        HealthSystem(scene);
        RenderSystem(scene, root);
        EventSystem(scene);

        // for (EntityID ent : SceneView<Health>(scene))
        // {
        //     Health *pHealth = scene.Get<Health>(ent);

        //     // Do stuff
        //     pHealth->health = std::max(0, pHealth->health - 1);
        // }
        last_key_state = key_state;
    }

    int main(int argc, char *argv[])
    {
        start();
#ifdef __EMSCRIPTEN__
        EM_ASM({
            window.canvas = document.getElementById('canvas');
            window.context = window.canvas.getContext('2d');

            let keyMap = ({'w' : 1, 's' : 0, 'a' : 2, 'd' : 3, 'e' : 4});

            window.canvas.onmousedown = function(evt) { Module._onMouseDown(evt.clientX, evt.clientY, evt.button); };
            window.canvas.onmouseup = function(evt) { Module._onMouseUp(evt.clientX, evt.clientY, evt.button); };
            window.canvas.onmousemove = function(evt) { Module._onMouseMove(evt.clientX, evt.clientY); };
            window.canvas.onkeydown = function(evt)
            {
                let key = keyMap[evt.key];
                if (key != null)
                    Module._onKeyDown(key);
            };
            window.canvas.onkeyup = function(evt)
            {
                let key = keyMap[evt.key];
                if (key != null)
                    Module._onKeyUp(key);
            };

            let request = 0;
            let lastTime = performance.now();

            function update(timestamp)
            {
                let dt = Math.min((timestamp - lastTime) / 1000, 1 / 60);
                lastTime = timestamp;
                Module._update(dt);
                request = window.requestAnimationFrame(update);
            }

            request = window.requestAnimationFrame(update);
        });
#endif
    }
}

#endif