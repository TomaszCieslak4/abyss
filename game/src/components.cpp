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
    int score;
    int kills;
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
    int damage = 10;
    int ammo = 100;
    int max_ammo = 100;
    double range = 10;
    double reload_time = 0.25;
    double bulletSpeed = 100;
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

struct WeaponReload
{
    static constexpr World::ComponentID id = 26;
    double reload_elapsed_time;
};

enum Shape
{
    rectangle,
    triangle
};

constexpr int MAX_COMPONENT = WeaponReload::id;

void assignComponent(World::Scene &scene, World::EntityID ent, World::ComponentID comp)
{
    if (comp == World::GetId<Transform>())
        scene.Assign<Transform>(ent);
    else if (comp == World::GetId<ObjectToWorld>())
        scene.Assign<ObjectToWorld>(ent);
    else if (comp == World::GetId<Parent>())
        scene.Assign<Parent>(ent);
    else if (comp == World::GetId<Despawn>())
        scene.Assign<Despawn>(ent);
    else if (comp == World::GetId<Children>())
        scene.Assign<Children>(ent);
    else if (comp == World::GetId<Collider>())
        scene.Assign<Collider>(ent);
    else if (comp == World::GetId<Rigidbody>())
        scene.Assign<Rigidbody>(ent);
    else if (comp == World::GetId<Collision>())
        scene.Assign<Collision>(ent);
    else if (comp == World::GetId<GroundDrop>())
        scene.Assign<GroundDrop>(ent);
    else if (comp == World::GetId<Event>())
        scene.Assign<Event>(ent);
    else if (comp == World::GetId<Camera>())
        scene.Assign<Camera>(ent);
    else if (comp == World::GetId<User>())
        scene.Assign<User>(ent);
    else if (comp == World::GetId<HealthPack>())
        scene.Assign<HealthPack>(ent);
    else if (comp == World::GetId<AmmoPack>())
        scene.Assign<AmmoPack>(ent);
    else if (comp == World::GetId<DeathAnimator>())
        scene.Assign<DeathAnimator>(ent);
    else if (comp == World::GetId<Health>())
        scene.Assign<Health>(ent);
    else if (comp == World::GetId<Weapon>())
        scene.Assign<Weapon>(ent);
    else if (comp == World::GetId<Bullet>())
        scene.Assign<Bullet>(ent);
    else if (comp == World::GetId<AI>())
        scene.Assign<AI>(ent);
    else if (comp == World::GetId<Crate>())
        scene.Assign<Crate>(ent);
    else if (comp == World::GetId<Color>())
        scene.Assign<Color>(ent);
    else if (comp == World::GetId<Outline>())
        scene.Assign<Outline>(ent);
    else if (comp == World::GetId<Renderer>())
        scene.Assign<Renderer>(ent);
    else if (comp == World::GetId<Arc>())
        scene.Assign<Arc>(ent);
    else if (comp == World::GetId<Polygon>())
        scene.Assign<Polygon>(ent);
    else if (comp == World::GetId<WeaponReload>())
        scene.Assign<WeaponReload>(ent);
}

#endif