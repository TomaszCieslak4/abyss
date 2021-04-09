#include "utils.hpp"
#include "scene.hpp"

void Utils::setParent(World::Scene &scene, World::EntityID ent, World::EntityID par)
{
    Parent *pParent = scene.Get<Parent>(ent);
    if (pParent != nullptr)
    {
        Children *pChildren = scene.Get<Children>(pParent->parent);
        if (pChildren == nullptr) pChildren = scene.Assign<Children>(pParent->parent);

        for (int i = 0; i < pChildren->children.size(); i++)
            if (pChildren->children[i] == ent)
                pChildren->children.erase(pChildren->children.begin() + i);
    }
    else
    {
        pParent = scene.Assign<Parent>(ent);
    }

    pParent->parent = par;

    Children *pChildren = scene.Get<Children>(par);
    if (pChildren == nullptr) pChildren = scene.Assign<Children>(par);
    pChildren->children.push_back(ent);
}

void Utils::destroyEntity(World::Scene &scene, World::EntityID ent)
{
    Parent *pParent = scene.Get<Parent>(ent);
    if (pParent != nullptr)
    {
        Children *pChildren = scene.Get<Children>(pParent->parent);

        if (pChildren != nullptr)
            for (int i = 0; i < pChildren->children.size(); i++)
                if (pChildren->children[i] == ent)
                    pChildren->children.erase(pChildren->children.begin() + i);
    }

    Children *pChildren = scene.Get<Children>(ent);

    if (pChildren != nullptr)
        for (int i = pChildren->children.size() - 1; i <= 0; i--)
            destroyEntity(scene, pChildren->children[i]);

    scene.DestroyEntity(ent);
}

Polygon *Utils::assignShape(World::Scene &scene, World::EntityID ent, Shape shape, bool addRenderer)
{
    Polygon *pMesh = scene.Assign<Polygon>(ent);
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

Transform *Utils::assignTransform(World::Scene &scene, World::EntityID ent, World::EntityID parent)
{
    Transform *pTransform = scene.Assign<Transform>(ent);
    scene.Assign<ObjectToWorld>(ent);
    setParent(scene, ent, parent);
    return pTransform;
}