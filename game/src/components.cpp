#ifndef COMPONENTS_H
#define COMPONENTS_H

#include <vector>

#include "vec2.cpp"
#include "matrix.cpp"
#include "scene.cpp"

struct Transform
{
    static constexpr World::ComponentID id = 1;
    Vec2 pos;
    Vec2 scale = Vec2::one();
    double rotation;
};

struct ObjectToWorld
{
    static constexpr World::ComponentID id = 2;
    Mat3 matrix = Mat3::identity();
};

struct Parent
{
    static constexpr World::ComponentID id = 3;
    World::EntityID parent;
};

struct Despawn
{
    static constexpr World::ComponentID id = 4;
    double time_to_despawn;
};

struct Children
{
    static constexpr World::ComponentID id = 5;
    std::vector<World::EntityID> children;
};

struct Collider
{
    static constexpr World::ComponentID id = 6;
};

struct Rigidbody
{
    static constexpr World::ComponentID id = 7;
    Vec2 velocity;
};

struct Collision
{
    static constexpr World::ComponentID id = 8;
    World::EntityID source;
    World::EntityID target;
    Vec2 mtv;
};

struct GroundDrop
{
    static constexpr World::ComponentID id = 9;
};

struct Event
{
    static constexpr World::ComponentID id = 10;
};

struct Camera
{
    static constexpr World::ComponentID id = 11;
    Mat3 world_to_view = Mat3::identity();
};

struct User
{
    static constexpr World::ComponentID id = 12;
};

struct HealthPack
{
    static constexpr World::ComponentID id = 13;
};

struct AmmoPack
{
    static constexpr World::ComponentID id = 14;
};

struct DeathAnimator
{
    static constexpr World::ComponentID id = 15;
};

struct Health
{
    static constexpr World::ComponentID id = 16;
    int health = 100;
    int max_health = 100;
};

struct Weapon
{
    static constexpr World::ComponentID id = 17;
    int damage;
    int ammo;
    int max_ammo;
    double range;
    double reload_time;
    double reload_elapsed_time;
};

struct Bullet
{
    static constexpr World::ComponentID id = 18;
    Vec2 startPos;
    double maxDistance;
    int damage;
    World::EntityID owner;
};

struct AI
{
    static constexpr World::ComponentID id = 19;
    double persuitRange;
    double watchRange;
};

struct Crate
{
    static constexpr World::ComponentID id = 20;
};

struct Color
{
    static constexpr World::ComponentID id = 21;
    uint8_t r;
    uint8_t g;
    uint8_t b;
    double a = 1;
};

struct Outline
{
    static constexpr World::ComponentID id = 22;
    double thickness = 0.05;
};

struct Renderer
{
    static constexpr World::ComponentID id = 23;
};

struct Arc
{
    static constexpr World::ComponentID id = 24;
    double start_angle;
    double end_angle = M_PI * 2;
};

struct Polygon
{
    static constexpr World::ComponentID id = 25;
    std::vector<Vec2> verticies;
};

enum Shape
{
    rectangle,
    triangle
};

constexpr int MAX_COMPONENT = Polygon::id;

#endif