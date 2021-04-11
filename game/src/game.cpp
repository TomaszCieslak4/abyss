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
constexpr double MOVEMENT_SPEED = 10;
constexpr double INTERACT_RANGE = 2.7;
constexpr int PLAYER_KILL_SCORE = 50;
constexpr int CRATE_KILL_SCORE = 10;
constexpr int ANIMATION_SPEED = 10;

enum Spawn
{
    ammo,
    health,
    crate,
    wall,
};

void spawnEntityRand(Scene &scene, EntityID root, Spawn type, int numToSpawn)
{
    int countInd = 0;

    for (int i = 0; i < 10000 && countInd < numToSpawn; i++)
    {
        Vec2 pos = Vec2(Utils::lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, Utils::drandom()),
                        Utils::lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, Utils::drandom()));
        bool safe = true;

        for (EntityID ent : SceneView<component::Transform>(scene))
        {
            component::Transform *pTransform = scene.Get<component::Transform>(ent);
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
            {
                EntityID ent = prefab::AmmoPack(scene, root, pos);
                Utils::setSiblingIndex(scene, ent, 0);
                break;
            }
            case Spawn::health:
            {
                EntityID ent = prefab::HealthPack(scene, root, pos);
                Utils::setSiblingIndex(scene, ent, 0);
                break;
            }
            case Spawn::crate:
            {
                EntityID ent = prefab::Crate(scene, root, pos);
                Utils::setSiblingIndex(scene, ent, 0);
                break;
            }
            case Spawn::wall:
            {
                EntityID ent = prefab::Wall(scene, root, pos);
                Utils::setSiblingIndex(scene, ent, 0);
                break;
            }
            default:
            {
                break;
            }
        }

        countInd++;
    }
}

EntityID spawnPlayerRand(Scene &scene)
{
    for (int i = 0; i < 10000; i++)
    {
        Vec2 pos = Vec2(Utils::lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, Utils::drandom()),
                        Utils::lerp(MIN_SPAWN_SEPERATION - PLAY_RADIUS, PLAY_RADIUS - MIN_SPAWN_SEPERATION, Utils::drandom()));
        bool safe = true;

        for (EntityID ent : SceneView<component::Transform>(scene))
        {
            component::Transform *pTransform = scene.Get<component::Transform>(ent);
            if (pTransform->pos.sqr_dist(pos) < MIN_SPAWN_SEPERATION * MIN_SPAWN_SEPERATION)
            {
                safe = false;
                break;
            }
        }

        if (!safe) continue;

        return prefab::Player(scene, pos);
    }

    std::cout << "HERE" << std::endl;
    return INVALID_ENTITY;
}

void loadScene(Scene &scene)
{
    // Create Boundries
    component::Color boundryColor = {16, 14, 23};
    prefab::Rectangle(scene, Vec2(0, COMBINED_SIZE), Vec2(2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH, 2 * BOUNDRY_DEPTH), 0, ROOT_ENTITY, boundryColor, true);
    prefab::Rectangle(scene, Vec2(0, -COMBINED_SIZE), Vec2(2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH, 2 * BOUNDRY_DEPTH), 0, ROOT_ENTITY, boundryColor, true);
    prefab::Rectangle(scene, Vec2(-COMBINED_SIZE, 0), Vec2(2 * BOUNDRY_DEPTH, 2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH), 0, ROOT_ENTITY, boundryColor, true);
    prefab::Rectangle(scene, Vec2(COMBINED_SIZE, 0), Vec2(2 * BOUNDRY_DEPTH, 2 * COMBINED_SIZE + 2 * BOUNDRY_DEPTH), 0, ROOT_ENTITY, boundryColor, true);

    // Spawn Random Item
    std::array<int, 4> counts = {8, 8, 10, 5};
    for (int i = 0; i < counts.size(); i++)
        spawnEntityRand(scene, ROOT_ENTITY, (Spawn)i, counts[i]);
}

} // namespace Game

#endif