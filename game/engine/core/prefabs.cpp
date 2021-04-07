#ifndef PREFABS_H
#define PREFABS_H

#include <vector>
#include <cmath>

#include "./vector.cpp"
#include "./matrix.cpp"
#include "./components.cpp"
#include "./game.cpp"

EntityID spawnRectangle(Scene &scene, Vec2 pos, Vec2 scale, double rotation, EntityID parent, Color color, bool addCollider = false)
{
    EntityID rectangle = scene.NewEntity();

    Transform *pTransform = assignTransform(scene, rectangle, parent);
    pTransform->pos = pos;
    pTransform->scale = scale;
    pTransform->rotation = rotation;

    assignShape(scene, rectangle, Shape::rectangle);

    Color *pColor = scene.Assign<Color>(rectangle);
    *pColor = color;

    if (addCollider) scene.Assign<Collider>(rectangle);

    return rectangle;
}

EntityID attachSniperPrefab(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    assignTransform(scene, gun, parent);
    scene.Assign<Weapon>(gun);

    spawnRectangle(scene, Vec2(0, 0), Vec2(0.5, 0.3), 0, gun, {255, 255, 255});
    spawnRectangle(scene, Vec2(0.85, 0), Vec2(0.15, 0.1), 0, gun, {249, 156, 35});
    spawnRectangle(scene, Vec2(0, 0), Vec2(0.7, 0.15), 0, gun, {255, 255, 255});

    return gun;
}

EntityID attachArPrefab(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    assignTransform(scene, gun, parent);
    scene.Assign<Weapon>(gun);

    spawnRectangle(scene, Vec2(0, 0), Vec2(0.5, 0.3), 0, gun, {255, 255, 255});
    spawnRectangle(scene, Vec2(0.45, 0), Vec2(0.15, 0.2), 0, gun, {249, 156, 35});

    return gun;
}

EntityID attachSmgPrefab(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    assignTransform(scene, gun, parent);
    scene.Assign<Weapon>(gun);

    spawnRectangle(scene, Vec2(0, 0), Vec2(0.5, 0.4), 0, gun, {255, 255, 255});
    spawnRectangle(scene, Vec2(0.47, 0), Vec2(0.4, 0.2), 0, gun, {249, 156, 35});

    return gun;
}

EntityID groundDropPrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = scene.NewEntity();

    Transform *pTransform = assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<GroundDrop>(groundDrop);

    {
        EntityID ring = scene.NewEntity();

        Transform *pTransform = assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(2.7, 2.7);

        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {57, 55, 62};
    }
    {
        EntityID ring = scene.NewEntity();

        Transform *pTransform = assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(2, 2);

        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {91, 89, 95};
    }
    {
        EntityID ring = scene.NewEntity();

        Transform *pTransform = assignTransform(scene, ring, groundDrop);
        pTransform->scale = Vec2(1.5, 1.5);

        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {119, 117, 122};
    }

    return groundDrop;
}

EntityID spawnHealthPackPrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = groundDropPrefab(scene, parent, pos);

    Transform *pTransform = assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<HealthPack>(groundDrop);

    spawnRectangle(scene, Vec2(0, 0), Vec2(0.2, 0.75), 0, groundDrop, {255, 154, 198});
    spawnRectangle(scene, Vec2(0, 0), Vec2(0.75, 0.2), 0, groundDrop, {255, 154, 198});

    return groundDrop;
}

EntityID spawnAmmoPackPrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = groundDropPrefab(scene, parent, pos);

    Transform *pTransform = assignTransform(scene, groundDrop, parent);
    pTransform->pos = pos;

    scene.Assign<AmmoPack>(groundDrop);

    {
        EntityID ammoPackVisual = scene.NewEntity();

        Transform *pTransform = assignTransform(scene, ammoPackVisual, groundDrop);
        pTransform->scale = Vec2(0.75, 0.75);

        assignShape(scene, ammoPackVisual, Shape::triangle);

        Color *pColor = scene.Assign<Color>(ammoPackVisual);
        *pColor = {242, 249, 35};
    }

    return groundDrop;
}

EntityID spawnCratePrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID crate = scene.NewEntity();

    Transform *pTransform = assignTransform(scene, crate, parent);
    pTransform->pos = pos;

    scene.Assign<Health>(crate);
    scene.Assign<Crate>(crate);

    double thickness = 0.05;
    Color outlineColor = {140, 140, 140};

    EntityID visual = spawnRectangle(scene, Vec2(0, 0), Vec2(2, 2), 0, crate, {35, 142, 249}, true);
    spawnRectangle(scene, Vec2(0, 0.5 - thickness / 2), Vec2(1, thickness), 0, visual, outlineColor);
    spawnRectangle(scene, Vec2(0, -0.5 + thickness / 2), Vec2(1, thickness), 0, visual, outlineColor);
    spawnRectangle(scene, Vec2(0.5 - thickness / 2, 0), Vec2(thickness, 1), 0, visual, outlineColor);
    spawnRectangle(scene, Vec2(-0.5 + thickness / 2, 0), Vec2(thickness, 1), 0, visual, outlineColor);
    spawnRectangle(scene, Vec2(0, 0), Vec2(thickness, sqrt(2 - 2 * thickness)), -M_PI / 4, visual, outlineColor);
    spawnRectangle(scene, Vec2(0, 0), Vec2(thickness, sqrt(2 - 2 * thickness)), M_PI / 4, visual, outlineColor);

    return crate;
}

EntityID spawnWallPrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID wall = scene.NewEntity();

    Transform *pTransform = assignTransform(scene, wall, parent);
    pTransform->pos = pos;

    spawnRectangle(scene, Vec2(0, 0), Vec2(4, 4), 0, wall, {255, 255, 255}, true);

    return wall;
}

#endif