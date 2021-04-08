#ifndef SAT_H
#define SAT_H

#include "./matrix.cpp"
#include "./vector.cpp"
#include <vector>
#include <iostream>

void project_onto_axis(std::vector<Vec2> &verticies, Vec2 &axis, double &min, double &max)
{
    for (int j = 0; j < verticies.size(); j++)
    {
        double dot = verticies[j].dot(axis);

        if (dot > max) max = dot;
        if (dot < min) min = dot;
    }
}

Vec2 circle_axis(Vec2 pos, std::vector<Vec2> &verticies)
{
    double closest_dist = INFINITY;
    Vec2 closest;

    for (int i = 0; i < verticies.size(); i++)
    {
        Vec2 delta = verticies[i] - pos;
        double temp = delta.sqr_magnitude();

        if (temp < closest_dist)
        {
            closest_dist = temp;
            closest = delta;
        }
    }

    return closest / sqrt(closest_dist);
}

bool sat(Scene &scene, EntityID ent1, EntityID ent2, Vec2 &mtv)
{
    ObjectToWorld *pObjectToWorld1 = scene.Get<ObjectToWorld>(ent1);
    ObjectToWorld *pObjectToWorld2 = scene.Get<ObjectToWorld>(ent2);

    std::vector<Vec2> verticies1;
    std::vector<Vec2> verticies2;
    std::vector<Vec2> axis;

    if (scene.Get<Arc>(ent1) != nullptr)
    {
        verticies1.push_back(pObjectToWorld1->matrix.get_translation());
    }
    else
    {
        Polygon *pPolygon = scene.Get<Polygon>(ent1);

        if (pPolygon != nullptr)
        {
            for (int i = 0; i < pPolygon->verticies.size(); i++)
                verticies1.push_back(pObjectToWorld1->matrix * pPolygon->verticies[i]);

            for (int i = 0; i < verticies1.size(); i++)
                axis.push_back((verticies1[(i + 1) % verticies1.size()] - verticies1[i]).normalize().prep());
        }
    }

    if (scene.Get<Arc>(ent2) != nullptr)
    {
        verticies2.push_back(pObjectToWorld2->matrix.get_translation());
    }
    else
    {
        Polygon *pPolygon = scene.Get<Polygon>(ent2);

        if (pPolygon != nullptr)
        {
            for (int i = 0; i < pPolygon->verticies.size(); i++)
                verticies2.push_back(pObjectToWorld2->matrix * pPolygon->verticies[i]);

            for (int i = 0; i < verticies2.size(); i++)
                axis.push_back((verticies2[(i + 1) % verticies2.size()] - verticies2[i]).normalize().prep());
        }
    }

    if (scene.Get<Arc>(ent1) != nullptr)
        axis.push_back(circle_axis(pObjectToWorld1->matrix.get_translation(), verticies2));

    if (scene.Get<Arc>(ent2) != nullptr)
        axis.push_back(circle_axis(pObjectToWorld2->matrix.get_translation(), verticies1));

    double min_overlap = INFINITY;
    for (int i = 0; i < axis.size(); i++)
    {
        double amin = INFINITY;
        double amax = -INFINITY;
        double bmin = INFINITY;
        double bmax = -INFINITY;

        if (scene.Get<Arc>(ent1) != nullptr)
        {
            double temp = verticies1[0].dot(axis[i]);
            amin = temp - pObjectToWorld1->matrix.get_scale().x / 2;
            amax = temp + pObjectToWorld1->matrix.get_scale().x / 2;
        }
        else
        {
            project_onto_axis(verticies1, axis[i], amin, amax);
        }

        if (scene.Get<Arc>(ent2) != nullptr)
        {
            double temp = verticies2[0].dot(axis[i]);
            bmin = temp - pObjectToWorld2->matrix.get_scale().x / 2;
            bmax = temp + pObjectToWorld2->matrix.get_scale().x / 2;
        }
        else
        {
            project_onto_axis(verticies2, axis[i], bmin, bmax);
        }

        if (amin >= bmax || amax <= bmin) return false;

        double max = std::min(amax, bmax);
        double min = std::max(amin, bmin);
        double overlap = max - min;

        if (overlap >= min_overlap) continue;

        min_overlap = overlap;
        mtv = axis[i] * min_overlap * ((amin < bmin) ? 1 : -1);
    }

    return true;
}

#endif