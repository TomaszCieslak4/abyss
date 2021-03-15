export function random() { return ((Math.random() - 0.5) * 2); }
export function lerp(min: number, max: number, t: number) { return min + (max - min) * t; }

// Easing functions
export function bezierBlend(t: number) { return t * t * (3.0 - 2.0 * t); }
export function easeIn(t: number) { return 2.0 * t * t; }
export function easeOut(t: number) { return 2.0 * t * (1.0 - t) + 0.5; }
export function parametricBlend(t: number) { let sqt = t * t; return sqt / (2.0 * (sqt - t) + 1.0); }
export function inOutQuadBlend(t: number) { if (t <= 0.5) return 2.0 * t * t; t -= 0.5; return 2.0 * t * (1.0 - t) + 0.5; }

export interface Type<T> { new(...args: any[]): T; }
