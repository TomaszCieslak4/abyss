#ifndef UTILS_CPP
#define UTILS_CPP

#include <cstdlib>
#include <cmath>

#include "scene.cpp"
#include "components.cpp"
#include "utils.cpp"

namespace Utils
{
void setSiblingIndex(Scene &scene, EntityID ent, int index)
{
    component::Parent *pParent = scene.Get<component::Parent>(ent);
    if (pParent == nullptr) return;

    component::Children *pChildren = scene.DirtyGet<component::Children>(pParent->parent);
    if (pChildren == nullptr) return;

    for (int i = 0; i < pChildren->children.size(); i++)
        if (pChildren->children[i] == ent)
            pChildren->children.erase(pChildren->children.begin() + i);

    index = std::min(std::max(index, 0), (int)pChildren->children.size());
    pChildren->children.insert(pChildren->children.begin() + index, ent);
}

void setParent(Scene &scene, EntityID ent, EntityID par)
{
    component::Parent *pParent = scene.DirtyGet<component::Parent>(ent);
    if (pParent != nullptr)
    {
        component::Children *pChildren = scene.DirtyGet<component::Children>(pParent->parent);
        if (pChildren == nullptr) pChildren = scene.DirtyAssign<component::Children>(pParent->parent);

        for (int i = 0; i < pChildren->children.size(); i++)
            if (pChildren->children[i] == ent)
                pChildren->children.erase(pChildren->children.begin() + i);
    }
    else
    {
        pParent = scene.DirtyAssign<component::Parent>(ent);
    }

    pParent->parent = par;

    component::Children *pChildren = scene.DirtyGet<component::Children>(par);
    if (pChildren == nullptr) pChildren = scene.DirtyAssign<component::Children>(par);
    pChildren->children.push_back(ent);
}

void destroyEntity(Scene &scene, EntityID ent)
{
    component::Parent *pParent = scene.Get<component::Parent>(ent);
    if (pParent != nullptr)
    {
        component::Children *pChildren = scene.DirtyGet<component::Children>(pParent->parent);

        if (pChildren != nullptr)
            for (int i = pChildren->children.size() - 1; i >= 0; i--)
                if (pChildren->children[i] == ent)
                    pChildren->children.erase(pChildren->children.begin() + i);
    }

    component::Children *pChildren = scene.Get<component::Children>(ent);

    if (pChildren != nullptr)
        for (int i = pChildren->children.size() - 1; i >= 0; i--)
            destroyEntity(scene, pChildren->children[i]);

    scene.DestroyEntity(ent);
}

component::Polygon *assignShape(Scene &scene, EntityID ent, component::Shape shape, bool addRenderer = true)
{
    component::Polygon *pMesh = scene.DirtyAssign<component::Polygon>(ent);
    if (addRenderer) scene.Assign<component::Renderer>(ent);

    switch (shape)
    {
        case component::Shape::rectangle:
            pMesh->verticies = {Vec2(-0.5, -0.5), Vec2(0.5, -0.5), Vec2(0.5, 0.5), Vec2(-0.5, 0.5)};
            break;

        case component::Shape::triangle:
            pMesh->verticies = {Vec2(0, -0.5), Vec2(0.5, 0.5), Vec2(-0.5, 0.5)};
            break;

        default:
            break;
    }

    return pMesh;
}

component::Transform *assignTransform(Scene &scene, EntityID ent, EntityID parent = ROOT_ENTITY)
{
    component::Transform *pTransform = scene.DirtyAssign<component::Transform>(ent);
    scene.Assign<component::ObjectToWorld>(ent);
    setParent(scene, ent, parent);
    return pTransform;
}

inline double lerp(double min, double max, double t) { return min + (max - min) * t; }
inline double drandom() { return (double)std::rand() / (double)RAND_MAX; }
inline int randInt(int min, int max) { return (std::rand() % (max - min + 1)) + min; }
inline double clamp(double value, double min, double max) { return std::min(std::max(value, min), max); }
} // namespace Utils

#endif