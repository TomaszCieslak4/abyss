#ifndef UTILS_CPP
#define UTILS_CPP

#include <cstdlib>
#include <cmath>

#include "scene.cpp"
#include "components.cpp"
#include "utils.cpp"

namespace Utils
{
void setSiblingIndex(World::Scene &scene, World::EntityID ent, int index)
{
    Parent *pParent = scene.Get<Parent>(ent);
    if (pParent == nullptr) return;

    Children *pChildren = scene.DirtyGet<Children>(pParent->parent);
    if (pChildren == nullptr) return;

    for (int i = 0; i < pChildren->children.size(); i++)
        if (pChildren->children[i] == ent)
            pChildren->children.erase(pChildren->children.begin() + i);

    index = std::min(std::max(index, 0), (int)pChildren->children.size());
    pChildren->children.insert(pChildren->children.begin() + index, ent);
}

void setParent(World::Scene &scene, World::EntityID ent, World::EntityID par)
{
    Parent *pParent = scene.DirtyGet<Parent>(ent);
    if (pParent != nullptr)
    {
        Children *pChildren = scene.DirtyGet<Children>(pParent->parent);
        if (pChildren == nullptr) pChildren = scene.DirtyAssign<Children>(pParent->parent);

        for (int i = 0; i < pChildren->children.size(); i++)
            if (pChildren->children[i] == ent)
                pChildren->children.erase(pChildren->children.begin() + i);
    }
    else
    {
        pParent = scene.DirtyAssign<Parent>(ent);
    }

    pParent->parent = par;

    Children *pChildren = scene.DirtyGet<Children>(par);
    if (pChildren == nullptr) pChildren = scene.DirtyAssign<Children>(par);
    pChildren->children.push_back(ent);
}

void destroyEntity(World::Scene &scene, World::EntityID ent)
{
    Parent *pParent = scene.Get<Parent>(ent);
    if (pParent != nullptr)
    {
        Children *pChildren = scene.DirtyGet<Children>(pParent->parent);

        if (pChildren != nullptr)
            for (int i = pChildren->children.size() - 1; i >= 0; i--)
                if (pChildren->children[i] == ent)
                    pChildren->children.erase(pChildren->children.begin() + i);
    }

    Children *pChildren = scene.Get<Children>(ent);

    if (pChildren != nullptr)
        for (int i = pChildren->children.size() - 1; i >= 0; i--)
            destroyEntity(scene, pChildren->children[i]);

    scene.DestroyEntity(ent);
}

Polygon *assignShape(World::Scene &scene, World::EntityID ent, Shape shape, bool addRenderer = true)
{
    Polygon *pMesh = scene.DirtyAssign<Polygon>(ent);
    if (addRenderer) scene.Assign<Renderer>(ent);

    switch (shape)
    {
        case Shape::rectangle:
            pMesh->verticies = {Vec2(-0.5, -0.5), Vec2(0.5, -0.5), Vec2(0.5, 0.5), Vec2(-0.5, 0.5)};
            break;

        case Shape::triangle:
            pMesh->verticies = {Vec2(0, -0.5), Vec2(0.5, 0.5), Vec2(-0.5, 0.5)};
            break;

        default:
            break;
    }

    return pMesh;
}

Transform *assignTransform(World::Scene &scene, World::EntityID ent, World::EntityID parent = World::ROOT_ENTITY)
{
    Transform *pTransform = scene.DirtyAssign<Transform>(ent);
    scene.Assign<ObjectToWorld>(ent);
    setParent(scene, ent, parent);
    return pTransform;
}

inline double lerp(double min, double max, double t) { return min + (max - min) * t; }
inline double drandom() { return (double)std::rand() / (double)RAND_MAX; }
inline int randInt(int min, int max) { return (std::rand() % (max - min + 1)) + min; }
inline double clamp(double value, double min, double max) { return std::min(std::max(value, min), max); }
} // namespace Utils

#endif