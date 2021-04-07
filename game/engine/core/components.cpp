#ifndef COMPONENTS_H
#define COMPONENTS_H

#include <vector>

#include "./vector.cpp"
#include "./matrix.cpp"
#include "./scene.cpp"

struct Transform
{
    Vec2 pos;
    Vec2 scale = Vec2::one();
    double rotation;
};

struct ObjectToWorld
{
    Mat3 matrix = Mat3::identity();
};

struct Parent
{
    EntityID parent;
};

struct Despawn
{
    double time_to_despawn;
};

struct Children
{
    std::vector<EntityID> children;
};

struct Collider
{
};

struct Rigidbody
{
    Vec2 velocity;
};

struct Collision
{
    EntityID source;
    EntityID target;
    Vec2 mtv;
};

struct GroundDrop
{
};

struct Event
{
};

struct Camera
{
    Mat3 world_to_view = Mat3::identity();
};

struct User
{
};

struct HealthPack
{
};

struct AmmoPack
{
};

struct DeathAnimator
{
};

struct Health
{
    int health = 100;
    int max_health = 100;
};

struct Weapon
{
    int damage;
    int ammo;
    int max_ammo;
    double range;
    double reload_time;
    double reload_elapsed_time;
};

struct Bullet
{
    Vec2 startPos;
    double maxDistance;
    int damage;
    EntityID owner;
};

struct AI
{
    double persuitRange;
    double watchRange;
};

struct Crate
{
};

struct Color
{
    uint8_t r;
    uint8_t g;
    uint8_t b;
    double a = 1;
};

struct Outline
{
    double thickness = 0.05;
};

struct Renderer
{
};

struct Arc
{
    double start_angle;
    double end_angle = M_PI * 2;
};

struct Polygon
{
    std::vector<Vec2> verticies;
};

enum Shape
{
    rectangle,
    triangle
};

void setParent(Scene &scene, EntityID ent, EntityID par)
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

void destroyEntity(Scene &scene, EntityID ent)
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

Polygon *assignShape(Scene &scene, EntityID ent, Shape shape, bool addRenderer = true)
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

Transform *assignTransform(Scene &scene, EntityID ent, EntityID parent = ROOT_ENTITY)
{
    Transform *pTransform = scene.Assign<Transform>(ent);
    scene.Assign<ObjectToWorld>(ent);
    setParent(scene, ent, parent);
    return pTransform;
}

#endif