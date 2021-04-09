#ifndef SAT_H
#define SAT_H

#include "vec2.hpp"
#include "scene.hpp"

bool sat(World::Scene &scene, World::EntityID ent1, World::EntityID ent2, Vec2 &mtv);
#endif