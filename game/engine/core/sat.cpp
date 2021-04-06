// bool rectRectIntersects(Mat3 &obj1, Mat3 &obj2, Collision &col)
// {
//     Vec2 pos1 = obj1.get_translation();
//     Vec2 pos2 = obj2.get_translation();
//     Vec2 scale1 = obj1.get_scale();
//     Vec2 scale2 = obj2.get_scale();

//     Vec2 diff = pos2 - pos1;
//     double sqr_mag = diff.sqr_magnitude();
//     double radius = (scale2.x + scale1.x) / 2;

//     if (sqr_mag >= radius * radius) return false;

//     col.mtv = diff * (1 - radius / sqrt(sqr_mag));
//     return true;
// }

// bool sat(std::vector<Vec2> vert1, std::vector<Vec2> vert2)
// {
//     double dot = 0;
//     std::vector<Vec2> perpendicularStack;

//     for (int i = 0; i < vert1.size(); i++)
//     {
//         perpendicularStack.push_back((vert1[(i + 1) % vert1.size()] - vert1[i]).prep());
//     }

//     for (int i = 0; i < vert2.size(); i++)
//     {
//         perpendicularStack.push_back((vert2[(i + 1) % vert2.size()] - vert2[i]).prep());
//     }

//     for (int i = 0; i < perpendicularStack.size(); i++)
//     {
//         double amin = INFINITY;
//         double amax = -INFINITY;
//         double bmin = INFINITY;
//         double bmax = -INFINITY;

//         for (int j = 0; j < vert1.size(); j++)
//         {
//             dot = vert1[j].dot(perpendicularStack[i]);

//             if (dot < amin)
//             {
//                 amax = dot;
//             }
//             if (dot < amin)
//             {
//                 amin = dot;
//             }
//         }
//         for (int j = 0; j < vert2.size(); j++)
//         {
//             dot = vert2[j].dot(perpendicularStack[i]);
//             if (dot > bmax)
//             {
//                 bmax = dot;
//             }
//             if (dot < bmin)
//             {
//                 bmin = dot;
//             }
//         }

//         if ((amin < bmax && amin > bmin) ||
//             (bmin < amax && bmin > amin))
//         {
//             continue;
//         }
//         else
//         {
//             return false;
//         }
//     }
//     return true;
// }

// std::vector<Vec2> genRectVerts(Mat3 &obj)
// {
//     std::vector<Vec2> verts;
//     verts.push_back(obj * Vec2(-0.5, -0.5));
//     verts.push_back(obj * Vec2(0.5, -0.5));
//     verts.push_back(obj * Vec2(0.5, 0.5));
//     verts.push_back(obj * Vec2(-0.5, 0.5));
//     return verts;
// }