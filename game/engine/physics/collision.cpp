
#ifndef COLLISION_H
#define COLLISION_H

#include "./collider.cpp";
#include "../util/vector.cpp";

struct Collision
{
    Collider collider;
    Vec2 correctionVector;
    Vec2 contactPoint;
    GameObject gameObject;
    Collider source;
};

#endif