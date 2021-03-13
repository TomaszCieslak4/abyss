export class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // Vector operations
    add(x) { return new Vec2(this.x + x.x, this.y + x.y); }
    sub(x) { return new Vec2(this.x - x.x, this.y - x.y); }
    div(x) { return new Vec2(this.x / x.x, this.y / x.y); }
    mul(x) { return new Vec2(this.x * x.x, this.y * x.y); }
    // Scalar operations
    add_s(x) { return new Vec2(this.x + x, this.y + x); }
    sub_s(x) { return new Vec2(this.x - x, this.y - x); }
    div_s(x) { return new Vec2(this.x / x, this.y / x); }
    mul_s(x) { return new Vec2(this.x * x, this.y * x); }
    // Inplace Vector operations
    i_add(x) { this.x += x.x; this.y += x.y; return this; }
    i_sub(x) { this.x -= x.x; this.y -= x.y; return this; }
    i_div(x) { this.x /= x.x; this.y /= x.y; return this; }
    i_mul(x) { this.x *= x.x; this.y *= x.y; return this; }
    // Inplace Scalar operations
    i_add_s(x) { this.x += x; this.y += x; return this; }
    i_sub_s(x) { this.x -= x; this.y -= x; return this; }
    i_div_s(x) { this.x /= x; this.y /= x; return this; }
    i_mul_s(x) { this.x *= x; this.y *= x; return this; }
    // MISC
    dot(x) { return this.x * x.x + this.y * x.y; }
    sqr_dist(x) { let dx = this.x - x.x; let dy = this.y - x.y; return dx * dx + dy * dy; }
    sqr_magnitude() { return this.x * this.x + this.y * this.y; }
    magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { let magnitude = this.magnitude(); return new Vec2(this.x / magnitude, this.y / magnitude); }
    i_normalize() { let magnitude = this.magnitude(); this.x /= magnitude; this.y /= magnitude; return this; }
    set(x) { this.x = x.x; this.y = x.y; return this; }
    set_s(x, y) { this.x = x; this.y = y; return this; }
    clamp(min, max) { return new Vec2(Math.min(Math.max(this.x, min.x), max.x), Math.min(Math.max(this.y, min.y), max.y)); }
    i_clamp(min, max) { this.x = Math.min(Math.max(this.x, min.x), max.x); this.y = Math.min(Math.max(this.y, min.y), max.y); return this; }
    copy() { return new Vec2(this.x, this.y); }
}
export class Rectangle {
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }
    copy() {
        return new Rectangle(this.pos.copy(), this.size.copy());
    }
    br() {
        return new Vec2(this.pos.x + this.size.x, this.pos.y + this.size.y);
    }
    clamp(other) {
        if (this.pos.x < other.pos.x) {
            this.pos.x = other.pos.x;
        }
        if (this.pos.y < other.pos.y) {
            this.pos.y = other.pos.y;
        }
        if (this.pos.x + this.size.x > other.pos.x + other.size.x) {
            this.pos.x = other.pos.x + other.size.x - this.size.x;
        }
        if (this.pos.y + this.size.y > other.pos.y + other.size.y) {
            this.pos.y = other.pos.y + other.size.y - this.size.y;
        }
    }
}
export class Circle {
    constructor(pos, radius) {
        this.pos = pos;
        this.radius = radius;
    }
    collidesRectange(rect) {
        var distX = Math.abs(this.pos.x - rect.pos.x - rect.size.x / 2);
        var distY = Math.abs(this.pos.y - rect.pos.y - rect.size.y / 2);
        if (distX > (rect.size.x / 2 + this.radius)) {
            return false;
        }
        if (distY > (rect.size.y / 2 + this.radius)) {
            return false;
        }
        if (distX <= (rect.size.x / 2)) {
            return true;
        }
        if (distY <= (rect.size.y / 2)) {
            return true;
        }
        var dx = distX - rect.size.x / 2;
        var dy = distY - rect.size.y / 2;
        return (dx * dx + dy * dy <= (this.radius * this.radius));
    }
}
export class Color {
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }
    lerp(x, t) {
        return new Color(lerp(this.r, x.r, t), lerp(this.g, x.g, t), lerp(this.b, x.b, t), lerp(this.a, x.a, t));
    }
    toColorString() {
        return `rgba(${this.r},${this.g},${this.b},${this.a})`;
    }
}
/** OBB Intersection Algorithm
 *  src: https://www.flipcode.com/archives/2D_OBB_Intersection.shtml
 */
export class OBB2D {
    constructor(center, size, angle) {
        /** Corners of the box, where 0 is the lower left. */
        this.corner = [new Vec2(0, 0), new Vec2(0, 0), new Vec2(0, 0), new Vec2(0, 0)];
        /** Two edges of the box extended away from corner[0]. */
        this.axis = [new Vec2(0, 0), new Vec2(0, 0)];
        /** origin[a] = corner[0].dot(axis[a]); */
        this.origin = [0];
        let x = new Vec2(Math.cos(angle), Math.sin(angle));
        let y = new Vec2(-Math.sin(angle), Math.cos(angle));
        x.i_mul_s(size.x / 2);
        y.i_mul_s(size.y / 2);
        this.corner[0] = center.sub(x).i_sub(y);
        this.corner[1] = center.add(x).i_sub(y);
        this.corner[2] = center.add(x).i_add(y);
        this.corner[3] = center.sub(x).i_add(y);
        this.computeAxes();
    }
    /** Returns true if other overlaps one dimension of this. */
    overlaps1Way(other) {
        for (let a = 0; a < 2; ++a) {
            let t = other.corner[0].dot(this.axis[a]);
            // Find the extent of box 2 on axis a
            let tMin = t;
            let tMax = t;
            for (let c = 1; c < 4; ++c) {
                t = other.corner[c].dot(this.axis[a]);
                if (t < tMin) {
                    tMin = t;
                }
                else if (t > tMax) {
                    tMax = t;
                }
            }
            // We have to subtract off the origin
            // See if [tMin, tMax] intersects [0, 1]
            if ((tMin > 1 + this.origin[a]) || (tMax < this.origin[a])) {
                // There was no intersection along this dimension;
                // the boxes cannot possibly overlap.
                return false;
            }
        }
        // There was no dimension along which there is no intersection.
        // Therefore the boxes overlap.
        return true;
    }
    /** Updates the axes after the corners move.  Assumes the
        corners actually form a rectangle. */
    computeAxes() {
        this.axis[0] = this.corner[1].sub(this.corner[0]);
        this.axis[1] = this.corner[3].sub(this.corner[0]);
        // Make the length of each axis 1/edge length so we know any
        // dot product must be less than 1 to fall within the edge.
        for (let a = 0; a < 2; ++a) {
            this.axis[a].i_div_s(this.axis[a].sqr_magnitude());
            this.origin[a] = this.corner[0].dot(this.axis[a]);
        }
    }
    /** For testing purposes. */
    moveTo(center) {
        let centroid = this.corner[0].add(this.corner[1]).i_add(this.corner[2]).i_add(this.corner[3]).i_div_s(4);
        let translation = center.sub(centroid);
        for (let c = 0; c < 4; ++c) {
            this.corner[c].i_add(translation);
        }
        this.computeAxes();
    }
    /** Returns true if the intersection of the boxes is non-empty. */
    overlaps(other) {
        return this.overlaps1Way(other) && other.overlaps1Way(this);
    }
}
export function random() { return ((Math.random() - 0.5) * 2); }
export function lerp(min, max, t) { return min + (max - min) * t; }
// Easing functions
export function bezierBlend(t) { return t * t * (3.0 - 2.0 * t); }
export function easeIn(t) { return 2.0 * t * t; }
export function easeOut(t) { return 2.0 * t * (1.0 - t) + 0.5; }
export function parametricBlend(t) { let sqt = t * t; return sqt / (2.0 * (sqt - t) + 1.0); }
export function inOutQuadBlend(t) { if (t <= 0.5)
    return 2.0 * t * t; t -= 0.5; return 2.0 * t * (1.0 - t) + 0.5; }
