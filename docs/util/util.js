export function floorDiv(a, b) { return Math.floor(a / b); }
export function random() { return ((Math.random() - 0.5) * 2); }
export function lerp(min, max, t) { return min + (max - min) * t; }
export function clampAngle(number) { return (number + Math.PI * 2) % (Math.PI * 2); }
// Easing functions
export function bezierBlend(t) { return t * t * (3.0 - 2.0 * t); }
export function easeIn(t) { return 2.0 * t * t; }
export function easeOut(t) { return 2.0 * t * (1.0 - t) + 0.5; }
export function parametricBlend(t) { let sqt = t * t; return sqt / (2.0 * (sqt - t) + 1.0); }
export function inOutQuadBlend(t) { if (t <= 0.5)
    return 2.0 * t * t; t -= 0.5; return 2.0 * t * (1.0 - t) + 0.5; }
