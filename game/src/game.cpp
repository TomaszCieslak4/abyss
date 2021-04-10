#ifndef GAME_H
#define GAME_H

#include "game.cpp"
#include "prefabs.cpp"
#include "scene_view.cpp"
#include "utils.cpp"
#include "components.cpp"
#include "scene.cpp"

namespace Game
{
// Radius
constexpr int PLAY_RADIUS = 50;
constexpr int BOUNDRY_DEPTH = 20;
constexpr int COMBINED_SIZE = BOUNDRY_DEPTH + PLAY_RADIUS;
constexpr int MIN_SPAWN_SEPERATION = 10;
const double MOVEMENT_SPEED = 10;

enum Spawn
{
    ammo,
    health,
    crate,
    wall,
};

void spawnEntityRand(World::Scene &scene, World::EntityID root, Spawn type, int numToSpawn)
{
    int countInd = 0;

    for (int i = 0; i < 10000 && countInd < numToSpawn; i++)
    {
        Vec2 pos = Vec2(Utils::lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, Utils::drandom()),
                        Utils::lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, Utils::drandom()));
        bool safe = true;

        for (World::EntityID ent : SceneView<Transform>(scene))
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
                Prefabs::spawnAmmoPackPrefab(scene, root, pos);
                break;
            case Spawn::health:
                Prefabs::spawnHealthPackPrefab(scene, root, pos);
                break;
            case Spawn::crate:
                Prefabs::spawnCratePrefab(scene, root, pos);
                break;
            case Spawn::wall:
                Prefabs::spawnWallPrefab(scene, root, pos);
                break;

            default:
                break;
        }

        countInd++;
    }
}

World::EntityID spawnPlayerRand(World::Scene &scene)
{
    for (int i = 0; i < 10000; i++)
    {
        Vec2 pos = Vec2(Utils::lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, Utils::drandom()),
                        Utils::lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, Utils::drandom()));
        bool safe = true;

        for (World::EntityID ent : SceneView<Transform>(scene))
        {
            Transform *pTransform = scene.Get<Transform>(ent);
            if (pTransform->pos.sqr_dist(pos) < MIN_SPAWN_SEPERATION * MIN_SPAWN_SEPERATION)
            {
                safe = false;
                break;
            }
        }

        if (!safe) continue;

        return Prefabs::spawnPlayerPrefab(scene, pos);
    }

    std::cout << "HERE" << std::endl;
    return INVALID_ENTITY;
}

void loadScene(World::Scene &scene)
{
    // Create Boundries
    Color boundryColor = {16, 14, 23};
    Prefabs::spawnRectangle(scene, Vec2(0, COMBINED_SIZE), Vec2(2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH, 2 * BOUNDRY_DEPTH), 0, World::ROOT_ENTITY, boundryColor, true);
    Prefabs::spawnRectangle(scene, Vec2(0, -COMBINED_SIZE), Vec2(2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH, 2 * BOUNDRY_DEPTH), 0, World::ROOT_ENTITY, boundryColor, true);
    Prefabs::spawnRectangle(scene, Vec2(-COMBINED_SIZE, 0), Vec2(2 * BOUNDRY_DEPTH, 2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH), 0, World::ROOT_ENTITY, boundryColor, true);
    Prefabs::spawnRectangle(scene, Vec2(COMBINED_SIZE, 0), Vec2(2 * BOUNDRY_DEPTH, 2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH), 0, World::ROOT_ENTITY, boundryColor, true);

    // Spawn Random Item
    std::array<int, 4> counts = {8, 8, 10, 5};
    for (int i = 0; i < counts.size(); i++)
        spawnEntityRand(scene, World::ROOT_ENTITY, (Spawn)i, counts[i]);
} // namespace Game

} // namespace Game

#endif