#ifndef GAME_H
#define GAME_H

#include <vector>
#include <cmath>

#include "./vector.cpp"
#include "./matrix.cpp"
#include "./components.cpp"
#include "./prefabs.cpp"
#include "./scene.cpp"

// Radius
constexpr int PLAY_RADIUS = 50;
constexpr int BOUNDRY_DEPTH = 20;
constexpr int COMBINED_SIZE = BOUNDRY_DEPTH + PLAY_RADIUS;
constexpr int MIN_SPAWN_SEPERATION = 10;

enum Spawn
{
    ammo,
    health,
    crate,
    wall,
};

inline double lerp(double min, double max, double t) { return min + (max - min) * t; }
inline double drandom() { return (double)std::rand() / (double)RAND_MAX; }

void spawnEntityRand(Scene &scene, EntityID root, Spawn type, int numToSpawn)
{
    int countInd = 0;

    for (int i = 0; i < 10000 && countInd < numToSpawn; i++)
    {
        Vec2 pos = Vec2(lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, drandom()), lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, drandom()));
        bool safe = true;

        for (EntityID ent : SceneView<Transform>(scene))
        {
            Transform *pTransform = scene.Get<Transform>(ent);
            if (pTransform->pos.sqr_dist(pos) < MIN_SPAWN_SEPERATION * MIN_SPAWN_SEPERATION)
            {
                safe = false;
                break;
            }
        }

        if (!safe) continue;

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

void loadScene(Scene &scene)
{
    // Camera
    {
        EntityID camera = scene.NewEntity();

        Transform *pTransform = assignTransform(scene, camera);
        pTransform->scale = Vec2(30, 30);

        scene.Assign<Camera>(camera);
    }

    // Create Boundries
    Color boundryColor = {16, 14, 23};
    spawnRectangle(scene, Vec2(0, COMBINED_SIZE), Vec2(2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH, 2 * BOUNDRY_DEPTH), 0, ROOT_ENTITY, boundryColor, true);
    spawnRectangle(scene, Vec2(0, -COMBINED_SIZE), Vec2(2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH, 2 * BOUNDRY_DEPTH), 0, ROOT_ENTITY, boundryColor, true);
    spawnRectangle(scene, Vec2(-COMBINED_SIZE, 0), Vec2(2 * BOUNDRY_DEPTH, 2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH), 0, ROOT_ENTITY, boundryColor, true);
    spawnRectangle(scene, Vec2(COMBINED_SIZE, 0), Vec2(2 * BOUNDRY_DEPTH, 2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH), 0, ROOT_ENTITY, boundryColor, true);

    // Spawn Random Item
    std::array<int, 4> counts = {8, 8, 10, 5};
    for (int i = 0; i < counts.size(); i++)
        spawnEntityRand(scene, ROOT_ENTITY, (Spawn)i, counts[i]);

    // Player
    EntityID player = scene.NewEntity();
    {
        Transform *pTransform = assignTransform(scene, player);
        pTransform->pos = Vec2(0, -1);

        scene.Assign<User>(player);
        scene.Assign<Rigidbody>(player);
        scene.Assign<Health>(player);
    }

    // Player Visual
    {
        EntityID playerVisual = scene.NewEntity();

        Transform *pTransform = assignTransform(scene, playerVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2, 2);

        scene.Assign<Arc>(playerVisual);
        scene.Assign<Renderer>(playerVisual);
        scene.Assign<Collider>(playerVisual);

        Color *pColor = scene.Assign<Color>(playerVisual);
        *pColor = {255, 255, 0};
    }

    // Health Visual Background
    {
        EntityID healthVisual = scene.NewEntity();

        Transform *pTransform = assignTransform(scene, healthVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2.3, 2.3);

        Arc *pArc = scene.Assign<Arc>(healthVisual);
        pArc->start_angle = M_PI_2 * 1.05;
        pArc->end_angle = 3 * M_PI_2 * 0.95;

        scene.Assign<Renderer>(healthVisual);
        scene.Assign<Outline>(healthVisual);

        Color *pColor = scene.Assign<Color>(healthVisual);
        *pColor = {255, 0, 0};
    }

    // Health Visual
    {
        EntityID healthVisual = scene.NewEntity();

        Transform *pTransform = assignTransform(scene, healthVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2.3, 2.3);

        Arc *pArc = scene.Assign<Arc>(healthVisual);
        pArc->start_angle = M_PI_2 * 1.05;
        pArc->end_angle = 3 * M_PI_2 * 0.95;

        scene.Assign<Renderer>(healthVisual);
        scene.Assign<Outline>(healthVisual);

        Color *pColor = scene.Assign<Color>(healthVisual);
        *pColor = {0, 255, 0};
    }

    // Player Weapon Spawnpoint
    {
        EntityID weaponSpawnpoint = scene.NewEntity();
        Transform *pTransform = assignTransform(scene, weaponSpawnpoint, player);
        pTransform->pos = Vec2(1, 0.45);

        // Player Weapon Prefab
        EntityID smg = attachSmgPrefab(scene, weaponSpawnpoint);
    }
}
#endif