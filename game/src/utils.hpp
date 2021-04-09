#ifndef UTILS_H
#define UTILS_H

#include <cstdlib>
#include <cmath>

#include "scene.hpp"
#include "components.hpp"

namespace Utils
{
void setParent(World::Scene &scene, World::EntityID ent, World::EntityID par);
void destroyEntity(World::Scene &scene, World::EntityID ent);
Polygon *assignShape(World::Scene &scene, World::EntityID ent, Shape shape, bool addRenderer = true);
Transform *assignTransform(World::Scene &scene, World::EntityID ent, World::EntityID parent = World::ROOT_ENTITY);

inline double lerp(double min, double max, double t) { return min + (max - min) * t; }
inline double drandom() { return (double)std::rand() / (double)RAND_MAX; }
} // namespace Utils

#endif