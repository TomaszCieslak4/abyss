
#ifndef TEST_H
#define TEST_H

#include "./components.cpp"
#include "./scene.cpp"
#include "./matrix.cpp"
#include "./vector.cpp"
#include "./game.cpp"
#include <vector>
#include <iostream>

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#endif

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

        double width;
        double height;
#ifdef __EMSCRIPTEN__

        width = EM_ASM_DOUBLE({
            window.canvas.width = window.canvas.clientWidth;
            return window.canvas.width;
        });

        height = EM_ASM_DOUBLE({
            window.canvas.height = window.canvas.clientHeight;
            return window.canvas.height;
        });

        EM_ASM({
            let context = window.context;
            context.clearRect(0, 0, $1, $2);
        },
               width, height);
#endif
        double size = std::min(width, height);
        Mat3 translate_o = Mat3::translate(identity, pTransform->pos * -1);
        Mat3 rotate_o = Mat3::rotate(translate_o, -pTransform->rotation);
        Mat3 scale_o = Mat3::scale(rotate_o, Vec2(1 / pTransform->scale.x, 1 / pTransform->scale.y));
        Mat3 scale_v = Mat3::scale(scale_o, Vec2(size, size));
        pCamera->world_to_view = Mat3::translate(scale_v, Vec2(width / 2, height / 2));
    }
}

void renderEntity(Scene &scene, EntityID ent, Mat3 &view_matrix)
{
    Color *pColor = scene.Get<Color>(ent);
    ObjectToWorld *pObjectToWorld = scene.Get<ObjectToWorld>(ent);

    if (pColor != nullptr && pObjectToWorld != nullptr)
    {
        Mat3 object_to_view = view_matrix * pObjectToWorld->matrix;

        Rect *pRect = scene.Get<Rect>(ent);

        if (pRect != nullptr)
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                let context = window.context;
                context.save();
                context.setTransform($0, $1, $2, $3, $4, $5);
                context.fillStyle = `rgba(${$6}, ${$7}, ${$8}, ${$9})`;
                context.fillRect(-0.5, -0.5, 1, 1);
                context.restore();
            },
                   object_to_view.array[0], object_to_view.array[3], object_to_view.array[1], object_to_view.array[4], object_to_view.array[2], object_to_view.array[5], pColor->r, pColor->g, pColor->b, pColor->a);
#endif
        }

        Arc *pArcRenderer = scene.Get<Arc>(ent);

        if (pArcRenderer != nullptr)
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                let context = window.context;
                context.save();
                context.setTransform($0, $1, $2, $3, $4, $5);
                context.fillStyle = `rgba(${$6}, ${$7}, ${$8}, ${$9})`;
                context.beginPath();
                context.arc(0, 0, 0.5, $10, $11);
                context.fill();
                context.restore();
            },
                   object_to_view.array[0], object_to_view.array[3], object_to_view.array[1], object_to_view.array[4], object_to_view.array[2], object_to_view.array[5], pColor->r, pColor->g, pColor->b, pColor->a, pArcRenderer->start_angle, pArcRenderer->end_angle);
#endif
        }

        Triangle *pTriangleRenderer = scene.Get<Triangle>(ent);

        if (pTriangleRenderer != nullptr)
        {
#ifdef __EMSCRIPTEN__
            EM_ASM({
                let context = window.context;
                context.save();
                context.setTransform($0, $1, $2, $3, $4, $5);
                context.fillStyle = `rgba(${$6}, ${$7}, ${$8}, ${$9})`;
                context.beginPath();
                context.moveTo(0, -0.5);
                context.lineTo(0.5, 0.5);
                context.lineTo(-0.5, 0.5);
                context.fill();
                context.restore();
            },
                   object_to_view.array[0], object_to_view.array[3], object_to_view.array[1], object_to_view.array[4], object_to_view.array[2], object_to_view.array[5], pColor->r, pColor->g, pColor->b, pColor->a);
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

bool circleCircleIntersects(Mat3 &obj1, Mat3 &obj2, Collision &col)
{
    Vec2 pos1 = obj1.get_translation();
    Vec2 pos2 = obj2.get_translation();
    Vec2 scale1 = obj1.get_scale();
    Vec2 scale2 = obj2.get_scale();

    Vec2 diff = pos2 - pos1;
    double sqr_mag = diff.sqr_magnitude();
    double radius = (scale2.x + scale1.x) / 2;

    if (sqr_mag >= radius * radius) return false;

    col.mtv = diff * (1 - radius / sqrt(sqr_mag));
    return true;
}

bool rectCircleIntersects(Mat3 &obj1, Mat3 &obj2, Collision &col)
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
    col.mtv = diff * ((circleRadius / sqrt(sqr_mag)) - 1);
    return true;
}

std::vector<Vec2> genRectVerts(Mat3 &obj)
{
    std::vector<Vec2> verts;
    verts.push_back(obj * Vec2(-0.5, -0.5));
    verts.push_back(obj * Vec2(0.5, -0.5));
    verts.push_back(obj * Vec2(0.5, 0.5));
    verts.push_back(obj * Vec2(-0.5, 0.5));
    return verts;
}

bool checkCollisionHelper(Scene &scene, EntityID ent, EntityID other, Collision &col)
{
    if (scene.Get<Collider>(ent) != nullptr)
    {
        ObjectToWorld *pObjectToWorld = scene.Get<ObjectToWorld>(ent);
        ObjectToWorld *pOtherObjectToWorld = scene.Get<ObjectToWorld>(other);

        if (scene.Get<Rect>(ent) != nullptr)
        {
            if (scene.Get<Rect>(other) != nullptr)
            {
                // if (sat(genRectVerts(pObjectToWorld->matrix), genRectVerts(pOtherObjectToWorld->matrix)))
                // {
                //     std::cout << "COLLIDING" << std::endl;
                // }
            }
            if (scene.Get<Arc>(other) != nullptr)
            {
                if (rectCircleIntersects(pObjectToWorld->matrix, pOtherObjectToWorld->matrix, col)) return true;
            }
        }

        if (scene.Get<Arc>(ent) != nullptr)
        {
            if (scene.Get<Rect>(other) != nullptr)
            {
                if (rectCircleIntersects(pOtherObjectToWorld->matrix, pObjectToWorld->matrix, col))
                {
                    col.mtv = col.mtv * -1;
                    return true;
                }
            }
            if (scene.Get<Arc>(other) != nullptr)
            {
                if (circleCircleIntersects(pObjectToWorld->matrix, pOtherObjectToWorld->matrix, col)) return true;
            }
        }
    }

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return false;
    for (EntityID ent : pChildren->children)
    {
        if (checkCollisionHelper(scene, ent, other, col)) return true;
    }
    return false;
}

bool checkCollision(Scene &scene, EntityID ent, EntityID topEnt, EntityID root, Collision &col)
{
    Children *pRootChildren = scene.Get<Children>(root);

    if (scene.Get<Collider>(ent) != nullptr)
    {
        for (EntityID rootEnt : pRootChildren->children)
        {
            if (topEnt == rootEnt) continue;
            if (checkCollisionHelper(scene, rootEnt, ent, col))
            {
                col.target = rootEnt;
                return true;
            }
        }
    }

    Children *pChildren = scene.Get<Children>(ent);
    if (pChildren == nullptr) return false;
    for (EntityID ent : pChildren->children)
    {
        if (checkCollision(scene, ent, topEnt, root, col)) return true;
    }
    return false;
}

void CollisionSystem(Scene &scene, EntityID root)
{
    // Generate Collisions
    for (EntityID ent : SceneView<ObjectToWorld, Rigidbody>(scene))
    {
        Collision col;
        if (checkCollision(scene, ent, ent, root, col))
        {
            // COLLIDED
            col.source = ent;
            EntityID collisionEvent = scene.NewEntity();
            scene.Assign<Event>(collisionEvent);
            Collision *pCollision = scene.Assign<Collision>(collisionEvent);
            *pCollision = col;
        }
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

void PlayerMovementSystem(Scene &scene, double elapsedTime)
{
    for (EntityID ent : SceneView<User>(scene))
    {
    }
}

extern "C"
{
    void onMouseClick(int x, int y)
    {
        std::cout << x << ", " << y << std::endl;
    }
}

Scene scene;
EntityID root;
double elapsedTime;

void start()
{
    root = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(root);
    scene.Assign<Children>(root);
    ObjectToWorld *pObjectToWorld = scene.Assign<ObjectToWorld>(root);
    pObjectToWorld->matrix = Mat3::identity();
    pTransform->scale = Vec2(1, 1);
    loadScene(scene, root, (Mode)0);
}

void loop()
{
    for (EntityID ent : SceneView<Transform, User>(scene))
    {
        Transform *pTransform = scene.Get<Transform>(ent);

        // Do stuff
        pTransform->pos.y = pTransform->pos.y + 0.1;
    }

    elapsedTime += 1.0 / 144;

    GroundDropSystem(scene, elapsedTime);
    ObjectToWorldSystem(scene, root);
    CollisionSystem(scene, root);
    ObjectToWorldSystem(scene, root);
    WorldToViewSystem(scene);
    RenderSystem(scene, root);
    EventSystem(scene);
}

#endif