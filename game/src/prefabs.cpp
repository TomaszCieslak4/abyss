#ifndef PREFABS_H
#define PREFABS_H

#include "scene.cpp"
#include "components.cpp"
#include "prefabs.cpp"
#include "vec2.cpp"
#include "utils.cpp"

namespace Prefabs
{
World::EntityID spawnRectangle(World::Scene &scene, Vec2 pos, Vec2 scale, double rotation, World::EntityID parent, Color color, bool addCollider = false)
{
    World::EntityID rectangle = scene.NewEntity();

    Transform *pTransform = Utils::assignTransform(scene, rectangle, parent);
    pTransform->pos = pos;
    pTransform->scale = scale;
    pTransform->rotation = rotation;

    Utils::assignShape(scene, rectangle, Shape::rectangle);

    Color *pColor = scene.Assign<Color>(rectangle);
    *pColor = color;

    if (addCollider) scene.Assign<Collider>(rectangle);

    return rectangle;
}

World::EntityID attachSniperPrefab(World::Scene &scene, World::EntityID parent)
{
    World::EntityID gun = scene.NewEntity();
    Utils::assignTransform(scene, gun, parent);
    scene.Assign<Weapon>(gun);

    spawnRectangle(scene, Vec2(0, 0), Vec2(0.5, 0.3), 0, gun, {255, 255, 255});
    spawnRectangle(scene, Vec2(0.85, 0), Vec2(0.15, 0.1), 0, gun, {249, 156, 35});
    spawnRectangle(scene, Vec2(0, 0), Vec2(0.7, 0.15), 0, gun, {255, 255, 255});

    return gun;
}

World::EntityID attachArPrefab(World::Scene &scene, World::EntityID parent)
{
    World::EntityID gun = scene.NewEntity();
    Utils::assignTransform(scene, gun, parent);
    scene.Assign<Weapon>(gun);

    spawnRectangle(scene, Vec2(0, 0), Vec2(0.5, 0.3), 0, gun, {255, 255, 255});
    spawnRectangle(scene, Vec2(0.45, 0), Vec2(0.15, 0.2), 0, gun, {249, 156, 35});

    return gun;
}

World::EntityID attachSmgPrefab(World::Scene &scene, World::EntityID parent)
{
    World::EntityID gun = scene.NewEntity();
    Utils::assignTransform(scene, gun, parent);
    scene.Assign<Weapon>(gun);

    spawnRectangle(scene, Vec2(0, 0), Vec2(0.5, 0.4), 0, gun, {255, 255, 255});
    spawnRectangle(scene, Vec2(0.47, 0), Vec2(0.4, 0.2), 0, gun, {249, 156, 35});

    return gun;
}

World::EntityID groundDropPrefab(World::Scene &scene, World::EntityID parent, Vec2 pos)
{
    World::EntityID groundDrop = scene.NewEntity();

    Transform *pTransform = Utils::assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<GroundDrop>(groundDrop);

    {
        World::EntityID ring = scene.NewEntity();

        Transform *pTransform = Utils::assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(2.7, 2.7);

        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {57, 55, 62};
    }
    {
        World::EntityID ring = scene.NewEntity();

        Transform *pTransform = Utils::assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(2, 2);

        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {91, 89, 95};
    }
    {
        World::EntityID ring = scene.NewEntity();

        Transform *pTransform = Utils::assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(1.5, 1.5);

        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {119, 117, 122};
    }

    return groundDrop;
}

World::EntityID spawnHealthPackPrefab(World::Scene &scene, World::EntityID parent, Vec2 pos)
{
    World::EntityID groundDrop = groundDropPrefab(scene, parent, pos);

    Transform *pTransform = Utils::assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<HealthPack>(groundDrop);

    spawnRectangle(scene, Vec2(0, 0), Vec2(0.2, 0.75), 0, groundDrop, {255, 154, 198});
    spawnRectangle(scene, Vec2(0, 0), Vec2(0.75, 0.2), 0, groundDrop, {255, 154, 198});

    return groundDrop;
}

World::EntityID spawnAmmoPackPrefab(World::Scene &scene, World::EntityID parent, Vec2 pos)
{
    World::EntityID groundDrop = groundDropPrefab(scene, parent, pos);

    Transform *pTransform = Utils::assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<AmmoPack>(groundDrop);

    {
        World::EntityID ammoPackVisual = scene.NewEntity();

        Transform *pTransform = Utils::assignTransform(scene, ammoPackVisual, groundDrop);
        pTransform->scale = Vec2(0.75, 0.75);

        Utils::assignShape(scene, ammoPackVisual, Shape::triangle);

        Color *pColor = scene.Assign<Color>(ammoPackVisual);
        *pColor = {242, 249, 35};
    }

    return groundDrop;
}

World::EntityID spawnCratePrefab(World::Scene &scene, World::EntityID parent, Vec2 pos)
{
    World::EntityID crate = scene.NewEntity();

    Transform *pTransform = Utils::assignTransform(scene, crate, parent);
    pTransform->pos = pos;

    scene.Assign<Health>(crate);
    scene.Assign<Crate>(crate);

    double thickness = 0.05;
    Color outlineColor = {140, 140, 140};

    World::EntityID visual = spawnRectangle(scene, Vec2(0, 0), Vec2(2, 2), 0, crate, {35, 142, 249}, true);
    spawnRectangle(scene, Vec2(0, 0.5 - thickness / 2), Vec2(1, thickness), 0, visual, outlineColor);
    spawnRectangle(scene, Vec2(0, -0.5 + thickness / 2), Vec2(1, thickness), 0, visual, outlineColor);
    spawnRectangle(scene, Vec2(0.5 - thickness / 2, 0), Vec2(thickness, 1), 0, visual, outlineColor);
    spawnRectangle(scene, Vec2(-0.5 + thickness / 2, 0), Vec2(thickness, 1), 0, visual, outlineColor);
    spawnRectangle(scene, Vec2(0, 0), Vec2(thickness, sqrt(2 - 2 * thickness)), -M_PI / 4, visual, outlineColor);
    spawnRectangle(scene, Vec2(0, 0), Vec2(thickness, sqrt(2 - 2 * thickness)), M_PI / 4, visual, outlineColor);

    return crate;
}

World::EntityID spawnWallPrefab(World::Scene &scene, World::EntityID parent, Vec2 pos)
{
    World::EntityID wall = scene.NewEntity();

    Transform *pTransform = Utils::assignTransform(scene, wall, parent);
    pTransform->pos = pos;

    spawnRectangle(scene, Vec2(0, 0), Vec2(4, 4), 0, wall, {255, 255, 255}, true);

    return wall;
}

World::EntityID spawnPlayerPrefab(World::Scene &scene, Vec2 pos)
{
    // Player
    World::EntityID player = scene.NewEntity();
    {
        Transform *pTransform = Utils::assignTransform(scene, player);
        pTransform->pos = Vec2(pos);

        scene.Assign<User>(player);
        scene.Assign<Rigidbody>(player);
        scene.Assign<Health>(player);
    }

    // Player Visual
    {
        World::EntityID playerVisual = scene.NewEntity();

        Transform *pTransform = Utils::assignTransform(scene, playerVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2, 2);

        scene.Assign<Arc>(playerVisual);
        scene.Assign<Renderer>(playerVisual);
        scene.Assign<Collider>(playerVisual);

        Color *pColor = scene.Assign<Color>(playerVisual);
        *pColor = {255, 255, 0};
    }
    // Health Visual Background
    {
        World::EntityID healthVisual = scene.NewEntity();

        Transform *pTransform = Utils::assignTransform(scene, healthVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2.3, 2.3);

        Arc *pArc = scene.Assign<Arc>(healthVisual);
        pArc->start_angle = M_PI_2 * 1.05;
        pArc->end_angle = 3 * M_PI_2 * 0.95;

        scene.Assign<Renderer>(healthVisual);
        scene.Assign<Outline>(healthVisual);

        Color *pColor = scene.Assign<Color>(healthVisual);
        *pColor = {255, 0, 0};
    }
    // Health Visual
    {
        World::EntityID healthVisual = scene.NewEntity();

        Transform *pTransform = Utils::assignTransform(scene, healthVisual, player);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(2.3, 2.3);

        Arc *pArc = scene.Assign<Arc>(healthVisual);
        pArc->start_angle = M_PI_2 * 1.05;
        pArc->end_angle = 3 * M_PI_2 * 0.95;

        scene.Assign<Renderer>(healthVisual);
        scene.Assign<Outline>(healthVisual);

        Color *pColor = scene.Assign<Color>(healthVisual);
        *pColor = {0, 255, 0};
    }
    // Player Weapon Spawnpoint
    {
        World::EntityID weaponSpawnpoint = scene.NewEntity();
        Transform *pTransform = Utils::assignTransform(scene, weaponSpawnpoint, player);
        pTransform->pos = Vec2(1, 0.45);

        // Player Weapon Prefab
        World::EntityID smg = attachSmgPrefab(scene, weaponSpawnpoint);
    }
    return player;
}
} // namespace Prefabs
#endif