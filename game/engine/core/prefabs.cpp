#ifndef PREFABS_H
#define PREFABS_H

#include "./game.cpp"
#include "./matrix.cpp"
#include "./vector.cpp"
#include "./components.cpp"
#include <vector>
#include <cmath>

EntityID attachSniperPrefab(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(gun);
    scene.Assign<ObjectToWorld>(gun);
    scene.Assign<Rect>(gun);
    scene.Assign<Renderer>(gun);
    setParent(scene, gun, parent);

    {
        EntityID gunVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(gunVisual);
        scene.Assign<ObjectToWorld>(gunVisual);
        scene.Assign<Rect>(gunVisual);
        scene.Assign<Renderer>(gunVisual);
        Color *pColor = scene.Assign<Color>(gunVisual);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(0.5, 0.3);
        *pColor = {255, 255, 255};
        setParent(scene, gunVisual, gun);
    }

    {
        EntityID gunVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(gunVisual);
        scene.Assign<ObjectToWorld>(gunVisual);
        scene.Assign<Rect>(gunVisual);
        scene.Assign<Renderer>(gunVisual);
        Color *pColor = scene.Assign<Color>(gunVisual);
        pTransform->pos = Vec2(0.85, 0);
        pTransform->scale = Vec2(0.15, 0.1);
        *pColor = {249, 156, 35};
        setParent(scene, gunVisual, gun);
    }

    {
        EntityID gunVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(gunVisual);
        scene.Assign<ObjectToWorld>(gunVisual);
        scene.Assign<Rect>(gunVisual);
        scene.Assign<Renderer>(gunVisual);
        Color *pColor = scene.Assign<Color>(gunVisual);
        pTransform->pos = Vec2(0.45, 0);
        pTransform->scale = Vec2(0.7, 0.15);
        *pColor = {255, 255, 255};
        setParent(scene, gunVisual, gun);
    }

    return gun;
}

EntityID attachArPrefab(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(gun);
    scene.Assign<ObjectToWorld>(gun);
    scene.Assign<Rect>(gun);
    scene.Assign<Renderer>(gun);
    setParent(scene, gun, parent);

    {
        EntityID gunVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(gunVisual);
        scene.Assign<ObjectToWorld>(gunVisual);
        scene.Assign<Rect>(gunVisual);
        scene.Assign<Renderer>(gunVisual);
        Color *pColor = scene.Assign<Color>(gunVisual);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(0.8, 0.3);
        *pColor = {255, 255, 255};
        setParent(scene, gunVisual, gun);
    }

    {
        EntityID gunVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(gunVisual);
        scene.Assign<ObjectToWorld>(gunVisual);
        scene.Assign<Rect>(gunVisual);
        scene.Assign<Renderer>(gunVisual);
        Color *pColor = scene.Assign<Color>(gunVisual);
        pTransform->pos = Vec2(0.45, 0);
        pTransform->scale = Vec2(0.15, 0.2);
        *pColor = {249, 156, 35};
        setParent(scene, gunVisual, gun);
    }

    return gun;
}

EntityID attachSmgPrefab(Scene &scene, EntityID parent)
{
    EntityID gun = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(gun);
    scene.Assign<ObjectToWorld>(gun);
    scene.Assign<Rect>(gun);
    scene.Assign<Renderer>(gun);
    setParent(scene, gun, parent);

    {
        EntityID gunVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(gunVisual);
        scene.Assign<ObjectToWorld>(gunVisual);
        scene.Assign<Rect>(gunVisual);
        scene.Assign<Renderer>(gunVisual);
        Color *pColor = scene.Assign<Color>(gunVisual);
        pTransform->pos = Vec2(0, 0);
        pTransform->scale = Vec2(0.5, 0.4);
        *pColor = {255, 255, 255};
        setParent(scene, gunVisual, gun);
    }

    {
        EntityID gunVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(gunVisual);
        scene.Assign<ObjectToWorld>(gunVisual);
        scene.Assign<Rect>(gunVisual);
        scene.Assign<Renderer>(gunVisual);
        Color *pColor = scene.Assign<Color>(gunVisual);
        pTransform->pos = Vec2(0.47, 0);
        pTransform->scale = Vec2(0.4, 0.2);
        *pColor = {249, 156, 35};
        setParent(scene, gunVisual, gun);
    }

    return gun;
}

EntityID groundDropPrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(groundDrop);
    scene.Assign<ObjectToWorld>(groundDrop); // Add with transform
    scene.Assign<GroundDrop>(groundDrop);    // Add with transform
    pTransform->pos = pos;
    setParent(scene, groundDrop, parent);
    {
        EntityID ring = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(ring);
        scene.Assign<ObjectToWorld>(ring); // Add with transform
        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);
        pTransform->scale = Vec2(2.7, 2.7);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {57, 55, 62};
        setParent(scene, ring, groundDrop);
    }
    {
        EntityID ring = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(ring);
        scene.Assign<ObjectToWorld>(ring); // Add with transform
        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);
        pTransform->scale = Vec2(2, 2);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {91, 89, 95};
        setParent(scene, ring, groundDrop);
    }
    {
        EntityID ring = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(ring);
        scene.Assign<ObjectToWorld>(ring); // Add with transform
        scene.Assign<Arc>(ring);
        scene.Assign<Renderer>(ring);
        pTransform->scale = Vec2(1.5, 1.5);

        Color *pColor = scene.Assign<Color>(ring);
        *pColor = {119, 117, 122};
        setParent(scene, ring, groundDrop);
    }

    return groundDrop;
}

void spawnHealthPackPrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = groundDropPrefab(scene, parent, pos);
    Transform *pTransform = scene.Get<Transform>(groundDrop);
    pTransform->pos = pos;
    {
        EntityID healthPack = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(healthPack);
        scene.Assign<ObjectToWorld>(healthPack); // Add with transform
        scene.Assign<Rect>(healthPack);
        scene.Assign<Renderer>(healthPack);
        pTransform->scale = Vec2(0.2, 0.75);

        Color *pColor = scene.Assign<Color>(healthPack);
        *pColor = {255, 154, 198};
        setParent(scene, healthPack, groundDrop);
    }
    {
        EntityID healthPack = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(healthPack);
        scene.Assign<ObjectToWorld>(healthPack); // Add with transform
        scene.Assign<Rect>(healthPack);
        scene.Assign<Renderer>(healthPack);
        pTransform->scale = Vec2(0.75, 0.2);

        Color *pColor = scene.Assign<Color>(healthPack);
        *pColor = {255, 154, 198};
        setParent(scene, healthPack, groundDrop);
    }
}

void spawnAmmoPackPrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID groundDrop = groundDropPrefab(scene, parent, pos);
    Transform *pTransform = scene.Get<Transform>(groundDrop);
    pTransform->pos = pos;
    {
        EntityID ammoPackVisual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(ammoPackVisual);
        scene.Assign<ObjectToWorld>(ammoPackVisual); // Add with transform
        scene.Assign<Triangle>(ammoPackVisual);
        scene.Assign<Renderer>(ammoPackVisual);
        pTransform->scale = Vec2(0.75, 0.75);

        Color *pColor = scene.Assign<Color>(ammoPackVisual);
        *pColor = {242, 249, 35};
        setParent(scene, ammoPackVisual, groundDrop);
    }
}

EntityID spawnCrateLines(Scene &scene, EntityID crate, Vec2 pos, Vec2 scale)
{
    EntityID crateLine = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(crateLine);
    scene.Assign<ObjectToWorld>(crateLine); // Add with transform
    scene.Assign<Rect>(crateLine);
    scene.Assign<Renderer>(crateLine);
    pTransform->pos = pos;
    pTransform->scale = scale;

    Color *pColor = scene.Assign<Color>(crateLine);
    *pColor = {140, 140, 140};
    setParent(scene, crateLine, crate);
    return crateLine;
}

void spawnCratePrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID crate = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(crate);
    scene.Assign<ObjectToWorld>(crate); // Add with transform
    setParent(scene, crate, parent);

    {
        EntityID visual = scene.NewEntity();
        Transform *pTransform = scene.Assign<Transform>(visual);
        scene.Assign<ObjectToWorld>(visual); // Add with transform
        scene.Assign<Rect>(visual);
        scene.Assign<Renderer>(visual);
        scene.Assign<Collider>(visual);
        pTransform->pos = pos;
        pTransform->scale = Vec2(1, 1);

        Color *pColor = scene.Assign<Color>(visual);
        *pColor = {255, 255, 255};
        setParent(scene, visual, crate);

        double thickness = 0.05;
        spawnCrateLines(scene, visual, Vec2(0, 0.5 - thickness / 2), Vec2(1, thickness));
        spawnCrateLines(scene, visual, Vec2(0, -0.5 + thickness / 2), Vec2(1, thickness));
        spawnCrateLines(scene, visual, Vec2(0.5 - thickness / 2, 0), Vec2(thickness, 1));
        spawnCrateLines(scene, visual, Vec2(-0.5 + thickness / 2, 0), Vec2(thickness, 1));

        {
            EntityID diag1 = spawnCrateLines(scene, visual, Vec2(0, 0), Vec2(thickness, sqrt(2 - 2 * thickness)));
            Transform *pTransform = scene.Get<Transform>(diag1);
            pTransform->rotation = -M_PI / 4;
        }

        {
            EntityID diag2 = spawnCrateLines(scene, visual, Vec2(0, 0), Vec2(thickness, sqrt(2 - 2 * thickness)));
            Transform *pTransform = scene.Get<Transform>(diag2);
            pTransform->rotation = M_PI / 4;
        }
    }
}

void spawnWallPrefab(Scene &scene, EntityID parent, Vec2 pos)
{
    EntityID wall = scene.NewEntity();
    Transform *pTransform = scene.Assign<Transform>(wall);
    scene.Assign<ObjectToWorld>(wall); // Add with transform
    scene.Assign<Rect>(wall);
    scene.Assign<Renderer>(wall);
    scene.Assign<Collider>(wall);
    pTransform->pos = pos;
    pTransform->scale = Vec2(4, 4);

    Color *pColor = scene.Assign<Color>(wall);
    *pColor = {255, 255, 255};
    setParent(scene, wall, parent);
}

#endif