#ifndef COMPONENTS_H
#define COMPONENTS_H

#include "./scene.cpp"
#include "./matrix.cpp"
#include "./vector.cpp"
#include <vector>

struct Transform
{
    Vec2 pos;
    Vec2 scale = Vec2::one();
    double rotation;
};

struct ObjectToWorld
{
    Mat3 matrix;
};

struct Parent
{
    EntityID parent;
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
    Mat3 world_to_view;
};

struct User
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

struct Color
{
    uint8_t r;
    uint8_t g;
    uint8_t b;
    double a = 1;
};

struct Renderer
{
};

struct Rect
{
};

struct Arc
{
    double start_angle;
    double end_angle = M_PI * 2;
};

struct Triangle
{
};

void setParent(Scene &scene, EntityID ent, EntityID par)
{
    Parent *pParent = scene.Get<Parent>(ent);
    if (pParent != nullptr)
    {
        Children *pChildren = scene.Get<Children>(pParent->parent);
        if (pChildren == nullptr) pChildren = scene.Assign<Children>(pParent->parent);

        for (int i = 0; i < pChildren->children.size(); i++)
        {
            if (pChildren->children[i] == ent)
            {
                pChildren->children.erase(pChildren->children.begin() + i);
            }
        }
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

#endif