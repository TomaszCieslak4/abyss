#ifndef GAME_H
#define GAME_H

#include "./scene.cpp"
#include "./prefabs.cpp"
#include "./matrix.cpp"
#include "./vector.cpp"
#include "./components.cpp"
#include <vector>
#include <cmath>

// Radius
constexpr int playRadius = 50;
constexpr int boundryRadius = 20;
constexpr int total = boundryRadius + playRadius;
constexpr int minDist = 10;

enum Spawn
{
    ammo,
    health,
    crate,
    wall,
};

void createBoundry(Scene &scene, EntityID root, int posX, int posY, int scaleX, int scaleY);
void spawnEntityRand(Scene &scene, EntityID root, Spawn type, int numToSpawn = 1);

inline double lerp(double min, double max, double t) { return min + (max - min) * t; }
inline double drandom() { return (double)std::rand() / (double)RAND_MAX; }

void loadScene(Scene &scene, EntityID root)
{
    int numItemPrefab = 40;
    int numAIPrefab = 15;
    int persuitRange = 30;
    int watchRange = 5;

    // Camera
    {
        EntityID camera = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(camera);
        scene.Assign<ObjectToWorld>(camera);
        scene.Assign<Camera>(camera);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(30, 30);
        setParent(scene, camera, root);
    }

    // Create Boundries
    createBoundry(scene, root, 0, total, 2 * total + 2 * boundryRadius, 2 * boundryRadius);
    createBoundry(scene, root, 0, -total, 2 * total + 2 * boundryRadius, 2 * boundryRadius);
    createBoundry(scene, root, -total, 0, 2 * boundryRadius, 2 * total + 2 * boundryRadius);
    createBoundry(scene, root, total, 0, 2 * boundryRadius, 2 * total + 2 * boundryRadius);

    // Spawn Random Item
    {
        std::array<int, 4> counts = {8, 8, 10, 5};
        for (int i = 0; i < counts.size(); i++)
        {
            spawnEntityRand(scene, root, (Spawn)i, counts[i]);
        }
    }

    // Player
    EntityID player = scene.NewEntity();
    {
        Transform *pTransform = scene.Assign<Transform>(player);
        scene.Assign<ObjectToWorld>(player);
        scene.Assign<User>(player);
        scene.Assign<Rigidbody>(player);
        scene.Assign<Health>(player);
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

    // Health Visual Background
    {
        EntityID healthVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(healthVisual);
        scene.Assign<ObjectToWorld>(healthVisual);
        scene.Assign<Renderer>(healthVisual);
        scene.Assign<Outline>(healthVisual);
        Arc *pArc = scene.Assign<Arc>(healthVisual);
        pArc->start_angle = M_PI_2 * 1.05;
        pArc->end_angle = 3 * M_PI_2 * 0.95;
        Color *pColor = scene.Assign<Color>(healthVisual);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2.3, 2.3);
        pColor->r = 255;
        setParent(scene, healthVisual, player);
    }

    // Health Visual
    {
        EntityID healthVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(healthVisual);
        scene.Assign<ObjectToWorld>(healthVisual);
        scene.Assign<Renderer>(healthVisual);
        scene.Assign<Outline>(healthVisual);
        Arc *pArc = scene.Assign<Arc>(healthVisual);
        pArc->start_angle = M_PI_2 * 1.05;
        pArc->end_angle = 3 * M_PI_2 * 0.95;
        Color *pColor = scene.Assign<Color>(healthVisual);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2.3, 2.3);
        pColor->g = 255;
        setParent(scene, healthVisual, player);
    }

    EntityID weaponSpawnpoint = scene.NewEntity();
    // Player Weapon Spawnpoint
    {
        Transform *pTransform = scene.Assign<Transform>(weaponSpawnpoint);
        scene.Assign<ObjectToWorld>(weaponSpawnpoint);
        pTransform->pos = Vec2(1, 0.45);
        setParent(scene, weaponSpawnpoint, player);
    }

    // Player Weapon Prefab
    {
        EntityID smg = attachSmgPrefab(scene, weaponSpawnpoint);
    }

    // Player Weapon Prefab
    {
        EntityID groundDrop = groundDropPrefab(scene, root, Vec2(10, 10));
        attachSmgPrefab(scene, groundDrop);
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

void spawnEntityRand(Scene &scene, EntityID root, Spawn type, int numToSpawn)
{
    int countInd = 0;

    for (int i = 0; i < 10000 && countInd < numToSpawn; i++)
    {
        Vec2 pos = Vec2(lerp(minDist - playRadius, playRadius - minDist, drandom()), lerp(minDist - playRadius, playRadius - minDist, drandom()));
        bool safe = true;
        for (EntityID ent : SceneView<Transform>(scene))
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

        switch (type)
        {
            case Spawn::ammo:
                spawnAmmoPackPrefab(scene, root, pos);
                break;
            case Spawn::health:
                spawnHealthPackPrefab(scene, root, pos);
                break;
            case Spawn::crate:
                spawnCratePrefab(scene, root, pos);
                break;
            case Spawn::wall:
                spawnWallPrefab(scene, root, pos);
                break;

            default:
                break;
        }
        countInd++;
    }
}

#endif