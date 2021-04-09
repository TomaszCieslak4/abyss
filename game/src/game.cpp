#include <iostream>

#include "game.hpp"
#include "prefabs.hpp"
#include "scene_view.hpp"
#include "utils.hpp"
#include "components.hpp"
#include "scene.hpp"

void Game::spawnEntityRand(World::Scene &scene, World::EntityID root, Game::Spawn type, int numToSpawn)
{
    int countInd = 0;

    for (int i = 0; i < 10000 && countInd < numToSpawn; i++)
    {
        Vec2 pos = Vec2(Utils::lerp(Game::MIN_SPAWN_SEPERATION - Game::PLAY_RADIUS, Game::PLAY_RADIUS - Game::MIN_SPAWN_SEPERATION, Utils::drandom()),
                        Utils::lerp(Game::MIN_SPAWN_SEPERATION - Game::PLAY_RADIUS, Game::PLAY_RADIUS - Game::MIN_SPAWN_SEPERATION, Utils::drandom()));
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
            case Game::Spawn::ammo:
                Prefabs::spawnAmmoPackPrefab(scene, root, pos);
                break;
            case Game::Spawn::health:
                Prefabs::spawnHealthPackPrefab(scene, root, pos);
                break;
            case Game::Spawn::crate:
                Prefabs::spawnCratePrefab(scene, root, pos);
                break;
            case Game::Spawn::wall:
                Prefabs::spawnWallPrefab(scene, root, pos);
                break;

            default:
                break;
        }

        countInd++;
    }
}

World::EntityID Game::spawnPlayerRand(World::Scene &scene)
{
    for (int i = 0; i < 10000; i++)
    {
        Vec2 pos = Vec2(Utils::lerp(Game::MIN_SPAWN_SEPERATION - Game::PLAY_RADIUS, Game::PLAY_RADIUS - Game::MIN_SPAWN_SEPERATION, Utils::drandom()),
                        Utils::lerp(Game::MIN_SPAWN_SEPERATION - Game::PLAY_RADIUS, Game::PLAY_RADIUS - Game::MIN_SPAWN_SEPERATION, Utils::drandom()));
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

void Game::loadScene(World::Scene &scene)
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