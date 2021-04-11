#ifndef PREFABS_H
#define PREFABS_H

#include "scene.cpp"
#include "components.cpp"
#include "prefabs.cpp"
#include "vec2.cpp"
#include "utils.cpp"

namespace prefab
{
EntityID Rectangle(Scene &scene, Vec2 pos, Vec2 scale, double rotation, EntityID parent, component::Color color, bool addCollider = false)
{
    EntityID rectangle = scene.NewEntity();

    component::Transform *pTransform = Utils::assignTransform(scene, rectangle, parent);
    pTransform->pos = pos;
    pTransform->scale = scale;
    pTransform->rotation = rotation;

    Utils::assignShape(scene, rectangle, component::Shape::rectangle);

    component::Color *pColor = scene.DirtyAssign<component::Color>(rectangle);
    *pColor = color;

    if (addCollider) scene.Assign<component::Collider>(rectangle);

    return rectangle;
}

EntityID Smg(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    Utils::assignTransform(scene, gun, parent);
    scene.Assign<component::Weapon>(gun);

    Rectangle(scene, Vec2(0, 0), Vec2(0.5, 0.4), 0, gun, {255, 255, 255});
    Rectangle(scene, Vec2(0.47, 0), Vec2(0.4, 0.2), 0, gun, {249, 156, 35});

    EntityID bulletSpawnpoint = scene.NewEntity();
    component::Transform *pTransform = Utils::assignTransform(scene, bulletSpawnpoint, gun);
    pTransform->pos = Vec2(1, 0);

    return gun;
}

EntityID AssultRifle(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    Utils::assignTransform(scene, gun, parent);
    scene.Assign<component::Weapon>(gun);

    Rectangle(scene, Vec2(0, 0), Vec2(0.8, 0.3), 0, gun, {255, 255, 255});
    Rectangle(scene, Vec2(0.45, 0), Vec2(0.15, 0.2), 0, gun, {249, 156, 35});

    EntityID bulletSpawnpoint = scene.NewEntity();
    component::Transform *pTransform = Utils::assignTransform(scene, bulletSpawnpoint, gun);
    pTransform->pos = Vec2(1, 0);

    return gun;
}

EntityID Sniper(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    Utils::assignTransform(scene, gun, parent);
    scene.Assign<component::Weapon>(gun);

    Rectangle(scene, Vec2(0, 0), Vec2(0.5, 0.3), 0, gun, {255, 255, 255});
    Rectangle(scene, Vec2(0.85, 0), Vec2(0.15, 0.1), 0, gun, {249, 156, 35});
    Rectangle(scene, Vec2(0.45, 0), Vec2(0.7, 0.15), 0, gun, {255, 255, 255});

    EntityID bulletSpawnpoint = scene.NewEntity();
    component::Transform *pTransform = Utils::assignTransform(scene, bulletSpawnpoint, gun);
    pTransform->pos = Vec2(1.5, 0);

    return gun;
}

EntityID GroundDrop(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = scene.NewEntity();

    component::Transform *pTransform = Utils::assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<component::GroundDrop>(groundDrop, false);

    {
        EntityID ring = scene.NewEntity();

        component::Transform *pTransform = Utils::assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(2.7, 2.7);

        scene.Assign<component::Arc>(ring);
        scene.Assign<component::Renderer>(ring);

        component::Color *pColor = scene.DirtyAssign<component::Color>(ring);
        *pColor = {57, 55, 62};
    }
    {
        EntityID ring = scene.NewEntity();

        component::Transform *pTransform = Utils::assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(2, 2);

        scene.Assign<component::Arc>(ring);
        scene.Assign<component::Renderer>(ring);

        component::Color *pColor = scene.DirtyAssign<component::Color>(ring);
        *pColor = {91, 89, 95};
    }
    {
        EntityID ring = scene.NewEntity();

        component::Transform *pTransform = Utils::assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(1.5, 1.5);

        scene.Assign<component::Arc>(ring);
        scene.Assign<component::Renderer>(ring);

        component::Color *pColor = scene.DirtyAssign<component::Color>(ring);
        *pColor = {119, 117, 122};
    }

    return groundDrop;
}

EntityID HealthPack(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = GroundDrop(scene, parent, pos);

    component::Transform *pTransform = Utils::assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<component::HealthPack>(groundDrop);

    Rectangle(scene, Vec2(0, 0), Vec2(0.2, 0.75), 0, groundDrop, {255, 154, 198});
    Rectangle(scene, Vec2(0, 0), Vec2(0.75, 0.2), 0, groundDrop, {255, 154, 198});

    return groundDrop;
}

EntityID AmmoPack(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = GroundDrop(scene, parent, pos);

    component::Transform *pTransform = Utils::assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<component::AmmoPack>(groundDrop);

    {
        EntityID ammoPackVisual = scene.NewEntity();

        component::Transform *pTransform = Utils::assignTransform(scene, ammoPackVisual, groundDrop);
        pTransform->scale = Vec2(0.75, 0.75);

        Utils::assignShape(scene, ammoPackVisual, component::Shape::triangle);

        component::Color *pColor = scene.DirtyAssign<component::Color>(ammoPackVisual);
        *pColor = {242, 249, 35};
    }

    return groundDrop;
}

EntityID Crate(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID crate = scene.NewEntity();

    component::Transform *pTransform = Utils::assignTransform(scene, crate, parent);
    pTransform->pos = pos;

    scene.Assign<component::Health>(crate);
    scene.Assign<component::Crate>(crate);

    double thickness = 0.05;
    component::Color outlineColor = {140, 140, 140};

    EntityID visual = scene.NewEntity();

    // Visual
    {
        component::Transform *pTransform = Utils::assignTransform(scene, visual, crate);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(3, 3);
        pTransform->rotation = 0;

        Utils::assignShape(scene, visual, component::Shape::rectangle);

        component::Color *pColor = scene.DirtyAssign<component::Color>(visual, false);
        *pColor = {35, 142, 249};
        scene.Assign<component::Collider>(visual);
    }

    Rectangle(scene, Vec2(0, 0.5 - thickness / 2), Vec2(1, thickness), 0, visual, outlineColor);
    Rectangle(scene, Vec2(0, -0.5 + thickness / 2), Vec2(1, thickness), 0, visual, outlineColor);
    Rectangle(scene, Vec2(0.5 - thickness / 2, 0), Vec2(thickness, 1), 0, visual, outlineColor);
    Rectangle(scene, Vec2(-0.5 + thickness / 2, 0), Vec2(thickness, 1), 0, visual, outlineColor);
    Rectangle(scene, Vec2(0, 0), Vec2(thickness, sqrt(2 - 2 * thickness)), -M_PI / 4, visual, outlineColor);
    Rectangle(scene, Vec2(0, 0), Vec2(thickness, sqrt(2 - 2 * thickness)), M_PI / 4, visual, outlineColor);

    return crate;
}

EntityID Wall(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID wall = scene.NewEntity();

    component::Transform *pTransform = Utils::assignTransform(scene, wall, parent);
    pTransform->pos = pos;

    Rectangle(scene, Vec2(0, 0), Vec2(4, 4), 0, wall, {255, 255, 255}, true);

    return wall;
}

EntityID Bullet(Scene &scene, EntityID root, Vec2 pos, double rotation)
{
    EntityID bullet = scene.NewEntity();
    component::Bullet *pBullet = scene.DirtyAssign<component::Bullet>(bullet);
    pBullet->startPos = pos;

    scene.Assign<component::Rigidbody>(bullet);

    component::Transform *pTransform = Utils::assignTransform(scene, bullet, root);
    pTransform->pos = pos;

    Rectangle(scene, Vec2(0, 0), Vec2(0.4, 0.2), rotation, bullet, {255, 255, 0}, true);

    return bullet;
}

EntityID Player(Scene &scene, Vec2 pos)
{
    // Player
    EntityID player = scene.NewEntity();
    {
        component::Transform *pTransform = Utils::assignTransform(scene, player);
        pTransform->pos = Vec2(pos);

        scene.Assign<component::User>(player);
        scene.Assign<component::Rigidbody>(player);
        scene.DirtyAssign<component::Health>(player);
    }

    // Player Visual
    {
        EntityID playerVisual = scene.NewEntity();

        component::Transform *pTransform = Utils::assignTransform(scene, playerVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2, 2);

        scene.Assign<component::Arc>(playerVisual);
        scene.Assign<component::Renderer>(playerVisual);
        scene.Assign<component::Collider>(playerVisual);

        component::Color *pColor = scene.DirtyAssign<component::Color>(playerVisual);
        *pColor = {255, 255, 0};
    }
    // component::Health Visual Background
    {
        EntityID healthVisual = scene.NewEntity();

        component::Transform *pTransform = Utils::assignTransform(scene, healthVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2.3, 2.3);

        component::Arc *pArc = scene.DirtyAssign<component::Arc>(healthVisual);
        pArc->start_angle = M_PI_2 * 1.05;
        pArc->end_angle = 3 * M_PI_2 * 0.95;

        scene.Assign<component::Renderer>(healthVisual);
        scene.Assign<component::Outline>(healthVisual);

        component::Color *pColor = scene.DirtyAssign<component::Color>(healthVisual);
        *pColor = {255, 0, 0};
    }
    // component::Health Visual
    {
        EntityID healthVisual = scene.NewEntity();

        component::Transform *pTransform = Utils::assignTransform(scene, healthVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2.3, 2.3);

        component::Arc *pArc = scene.DirtyAssign<component::Arc>(healthVisual, false);
        pArc->start_angle = M_PI_2 * 1.05;
        pArc->end_angle = 3 * M_PI_2 * 0.95;

        scene.Assign<component::Renderer>(healthVisual);
        scene.Assign<component::Outline>(healthVisual);

        component::Color *pColor = scene.DirtyAssign<component::Color>(healthVisual);
        *pColor = {0, 255, 0};
    }
    // Player component::Weapon Spawnpoint
    {
        EntityID weaponSpawnpoint = scene.NewEntity();
        component::Transform *pTransform = Utils::assignTransform(scene, weaponSpawnpoint, player);
        pTransform->pos = Vec2(1, 0.45);

        // Player component::Weapon Prefab
        EntityID smg = Smg(scene, weaponSpawnpoint);
    }
    return player;
}
} // namespace prefab
#endif