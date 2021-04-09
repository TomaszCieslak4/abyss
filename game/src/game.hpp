#ifndef GAME_H
#define GAME_H

#include "scene.hpp"

namespace Game
{
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

void spawnEntityRand(World::Scene &scene, World::EntityID root, Spawn type, int numToSpawn);
World::EntityID spawnPlayerRand(World::Scene &scene);
void loadScene(World::Scene &scene);

} // namespace Game

#endif