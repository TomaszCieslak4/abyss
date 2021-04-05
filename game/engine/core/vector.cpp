#ifndef VECTOR_H
#define VECTOR_H

#include <math.h>
#include <algorithm>

class Vec2
{
  public:
    double x;
    double y;

    Vec2()
    {
        this->x = 0;
        this->y = 0;
    }

    Vec2(double x, double y)
    {
        this->x = x;
        this->y = y;
    }

    // Vector operations
    Vec2 operator+(const Vec2 &x) { return Vec2(this->x + x.x, this->y + x.y); }
    Vec2 operator-(const Vec2 &x) { return Vec2(this->x - x.x, this->y - x.y); }
    Vec2 operator/(const Vec2 &x) { return Vec2(this->x / x.x, this->y / x.y); }
    Vec2 operator*(const Vec2 &x) { return Vec2(this->x * x.x, this->y * x.y); }

    // Scalar operations
    Vec2 operator+(double x) { return Vec2(this->x + x, this->y + x); }
    Vec2 operator-(double x) { return Vec2(this->x - x, this->y - x); }
    Vec2 operator/(double x) { return Vec2(this->x / x, this->y / x); }
    Vec2 operator*(double x) { return Vec2(this->x * x, this->y * x); }

    // MISC
    double dot(Vec2 &x) { return this->x * x.x + this->y * x.y; }
    Vec2 prep() { return Vec2(-this->y, this->x); }
    double sqr_dist(const Vec2 &x)
    {
        double dx = this->x - x.x;
        double dy = this->y - x.y;
        return dx * dx + dy * dy;
    }
    double sqr_magnitude() { return this->x * this->x + this->y * this->y; }
    double magnitude() { return sqrt(this->sqr_magnitude()); }
    Vec2 normalize()
    {
        double magnitude = this->magnitude();
        return Vec2(this->x / magnitude, this->y / magnitude);
    }
    Vec2 clamp(const Vec2 &min, const Vec2 &max) { return Vec2(std::min(std::max(this->x, min.x), max.x), std::min(std::max(this->y, min.y), max.y)); }
    double get_angle() { return fmod((atan2(this->y, this->x) + M_PI * 2), (M_PI * 2)); }

    static Vec2 lerp(const Vec2 &start, const Vec2 &end, double t) { return Vec2(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t); }
    static Vec2 zero() { return Vec2(0, 0); }
    static Vec2 one() { return Vec2(1, 1); }
    static Vec2 from_angle(double angle) { return Vec2(cos(angle), sin(angle)); }
};

#endif
