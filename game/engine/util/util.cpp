#ifndef UTIL_H
#define UTIL_H

#include <math.h>
// export interface Type<T> { new(...args: any[]): T; }

// double floorDiv(a: number, b: number) { return Math.floor(a / b); }
// double random() { return ((Math.random() - 0.5) * 2); }
// double lerp(min: number, max: number, t: number) { return min + (max - min) * t; }
double clampAngle(double number) { return fmod((number + M_PI * 2), (M_PI * 2)); }
// double clamp(number: number, min: number, max: number) { return Math.min(Math.max(number, min), max); }

// Easing functions
// double bezierBlend(t: number) { return t * t * (3.0 - 2.0 * t); }
// double easeIn(t: number) { return 2.0 * t * t; }
// double easeOut(t: number) { return 2.0 * t * (1.0 - t) + 0.5; }
// double parametricBlend(t: number) { let sqt = t * t; return sqt / (2.0 * (sqt - t) + 1.0); }
// double inOutQuadBlend(t: number) { if (t <= 0.5) return 2.0 * t * t; t -= 0.5; return 2.0 * t * (1.0 - t) + 0.5; }

#endif
