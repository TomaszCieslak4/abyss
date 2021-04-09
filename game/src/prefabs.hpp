#ifndef PREFABS_H
#define PREFABS_H

#include "scene.hpp"
#include "vec2.hpp"
#include "components.hpp"

namespace Prefabs
{
World::EntityID spawnRectangle(World::Scene &scene, Vec2 pos, Vec2 scale, double rotation, World::EntityID parent, Color color, bool addCollider = false);
World::EntityID attachSniperPrefab(World::Scene &scene, World::EntityID parent);
World::EntityID attachArPrefab(World::Scene &scene, World::EntityID parent);
World::EntityID attachSmgPrefab(World::Scene &scene, World::EntityID parent);
World::EntityID groundDropPrefab(World::Scene &scene, World::EntityID parent, Vec2 pos);
World::EntityID spawnHealthPackPrefab(World::Scene &scene, World::EntityID parent, Vec2 pos);
World::EntityID spawnAmmoPackPrefab(World::Scene &scene, World::EntityID parent, Vec2 pos);
World::EntityID spawnCratePrefab(World::Scene &scene, World::EntityID parent, Vec2 pos);
World::EntityID spawnWallPrefab(World::Scene &scene, World::EntityID parent, Vec2 pos);
World::EntityID spawnPlayerPrefab(World::Scene &scene, Vec2 pos);
} // namespace Prefabs
#endif