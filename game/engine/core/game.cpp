#ifndef GAME_H
#define GAME_H

#include "./scene.cpp"
#include "./prefabs.cpp"
#include "./matrix.cpp"
#include "./vector.cpp"
#include "./components.cpp"
#include <vector>
#include <cmath>

enum Mode
{
    easy,
    medium,
    hard,
};

void createBoundry(Scene &scene, EntityID root, int posX, int posY, int scaleX, int scaleY);
void spawnRandomItem(Scene &scene, EntityID root, Vec2 pos);

inline double lerp(double min, double max, double t) { return min + (max - min) * t; }
inline double drandom() { return (double)std::rand() / (double)RAND_MAX; }

void loadScene(Scene &scene, EntityID root, Mode mode)
{
    int numItemPrefab = 0;
    int numAIPrefab = 0;
    int persuitRange = 0;
    int watchRange = 0;

    // Change opitions depending on difficulty
    switch (mode)
    {
        case Mode::easy:
            numItemPrefab = 10;
            numAIPrefab = 5;
            persuitRange = 15;
            watchRange = 5;
            break;
        case Mode::medium:
            numItemPrefab = 15;
            numAIPrefab = 10;
            persuitRange = 20;
            watchRange = 5;
            break;
        case Mode::hard:
            numItemPrefab = 25;
            numAIPrefab = 15;
            persuitRange = 30;
            watchRange = 5;
            break;
    }

    // Camera
    {
        EntityID camera = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(camera);
        scene.Assign<Camera>(camera);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(30, 30);
    }

    // Radius
    int playRadius = 50;
    int boundryRadius = 20;
    int total = boundryRadius + playRadius;

    // Create Boundries
    createBoundry(scene, root, 0, total, 2 * total + 2 * boundryRadius, 2 * boundryRadius);
    createBoundry(scene, root, 0, -total, 2 * total + 2 * boundryRadius, 2 * boundryRadius);
    createBoundry(scene, root, -total, 0, 2 * boundryRadius, 2 * total + 2 * boundryRadius);
    createBoundry(scene, root, total, 0, 2 * boundryRadius, 2 * total + 2 * boundryRadius);

    // Spawn Random Item
    {
        int minDist = 10;
        int spawned = 0;
        for (int i = 0; i < 10000 && spawned < numItemPrefab; i++)
        {
            Vec2 pos = Vec2(lerp(minDist - playRadius, playRadius - minDist, drandom()), lerp(minDist - playRadius, playRadius - minDist, drandom()));
            bool safe = true;
            for (EntityID ent : SceneView<Transform, Collider>(scene))
            {
                Transform *pTransform = scene.Get<Transform>(ent);
                if (pTransform->pos.sqr_dist(pos) < minDist * minDist)
                {
                    safe = false;
                    break;
                }
            }
            if (!safe)
                continue;
            spawnRandomItem(scene, root, pos);
            spawned++;
        }
    }

    {
        EntityID wall = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(wall);
        scene.Assign<ObjectToWorld>(wall); // Add with transform
        scene.Assign<Rect>(wall);
        scene.Assign<Renderer>(wall);
        scene.Assign<Rigidbody>(wall);
        scene.Assign<Collider>(wall);
        pTransform->pos = Vec2(1, 4);
        pTransform->scale = Vec2(4, 4);

        Color *pColor = scene.Assign<Color>(wall);
        *pColor = {255, 255, 255};
        setParent(scene, wall, root);
    }
    {
        EntityID wall = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(wall);
        scene.Assign<ObjectToWorld>(wall); // Add with transform
        scene.Assign<Rect>(wall);
        scene.Assign<Renderer>(wall);
        scene.Assign<Collider>(wall);
        pTransform->pos = Vec2(0, 3);
        pTransform->scale = Vec2(4, 4);

        Color *pColor = scene.Assign<Color>(wall);
        *pColor = {255, 255, 255};
        setParent(scene, wall, root);
    }

    // Player
    EntityID player = scene.NewEntity();
    {
        Transform *pTransform = scene.Assign<Transform>(player);
        scene.Assign<ObjectToWorld>(player);
        scene.Assign<User>(player);
        scene.Assign<Rigidbody>(player);
        pTransform->pos = Vec2(0, -1);
        setParent(scene, player, root);
    }
    // Player Visual
    {
        EntityID playerVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(playerVisual);
        scene.Assign<ObjectToWorld>(playerVisual);
        scene.Assign<Renderer>(playerVisual);
        scene.Assign<Arc>(playerVisual);
        scene.Assign<Collider>(playerVisual);
        Color *pColor = scene.Assign<Color>(playerVisual);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2, 2);
        pColor->r = 255;
        pColor->g = 255;
        setParent(scene, playerVisual, player);
    }

    {
        EntityID groundDrop = groundDropPrefab(scene, root, Vec2(0, -4));
        attachSmgPrefab(scene, groundDrop);
    }

    {
        EntityID groundDrop = groundDropPrefab(scene, root, Vec2(2, 4));
        attachArPrefab(scene, groundDrop);
    }

    {
        EntityID groundDrop = groundDropPrefab(scene, root, Vec2(0, -2));
        attachSniperPrefab(scene, groundDrop);
    }
    spawnAmmoPackPrefab(scene, root, Vec2(-4, 0));
    spawnHealthPackPrefab(scene, root, Vec2(-6, 0));

    // Weapon Prefab
    {
        EntityID smg = attachSmgPrefab(scene, player);
        Transform *pTransform = scene.Get<Transform>(smg);
        pTransform->pos = Vec2(1, 0.45);
    }
}

void createBoundry(Scene &scene, EntityID root, int posX, int posY, int scaleX, int scaleY)
{
    Color boundryColor = {16, 14, 23};

    EntityID boundry = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(boundry);
    scene.Assign<ObjectToWorld>(boundry); // Add with transform

    scene.Assign<Rect>(boundry);
    scene.Assign<Renderer>(boundry);
    scene.Assign<Collider>(boundry);
    pTransform->pos = Vec2(posX, posY);
    pTransform->scale = Vec2(scaleX, scaleY);

    Color *pColor = scene.Assign<Color>(boundry);
    *pColor = boundryColor;
    setParent(scene, boundry, root);
}

void spawnRandomItem(Scene &scene, EntityID root, Vec2 pos)
{
    int num = std::round((drandom() * 10));
    switch (num)
    {
        case 0:
        case 1:
        case 2:
            spawnAmmoPackPrefab(scene, root, pos);
            break;
        case 3:
        case 4:
        case 5:
            spawnCratePrefab(scene, root, pos);
            break;
        case 6:
        case 7:
            spawnHealthPackPrefab(scene, root, pos);
            break;
        case 8:
        case 9:
        case 10:
            spawnWallPrefab(scene, root, pos);
            break;
        default:
            break;
    }
}
#endif