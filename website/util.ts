export class Vec2 {
    constructor(public x: number, public y: number) { }

    // Vector operations
    add(x: Vec2) { return new Vec2(this.x + x.x, this.y + x.y); }
    sub(x: Vec2) { return new Vec2(this.x - x.x, this.y - x.y); }
    div(x: Vec2) { return new Vec2(this.x / x.x, this.y / x.y); }
    mul(x: Vec2) { return new Vec2(this.x * x.x, this.y * x.y); }

    // Scalar operations
    add_s(x: number) { return new Vec2(this.x + x, this.y + x); }
    sub_s(x: number) { return new Vec2(this.x - x, this.y - x); }
    div_s(x: number) { return new Vec2(this.x / x, this.y / x); }
    mul_s(x: number) { return new Vec2(this.x * x, this.y * x); }

    // Inplace Vector operations
    i_add(x: Vec2) { this.x += x.x; this.y += x.y; return this; }
    i_sub(x: Vec2) { this.x -= x.x; this.y -= x.y; return this; }
    i_div(x: Vec2) { this.x /= x.x; this.y /= x.y; return this; }
    i_mul(x: Vec2) { this.x *= x.x; this.y *= x.y; return this; }

    // Inplace Scalar operations
    i_add_s(x: number) { this.x += x; this.y += x; return this; }
    i_sub_s(x: number) { this.x -= x; this.y -= x; return this; }
    i_div_s(x: number) { this.x /= x; this.y /= x; return this; }
    i_mul_s(x: number) { this.x *= x; this.y *= x; return this; }

    // MISC
    dot(x: Vec2) { return this.x * x.x + this.y * x.y; }
    sqr_dist(x: Vec2) { let dx = this.x - x.x; let dy = this.y - x.y; return dx * dx + dy * dy; }
    sqr_magnitude() { return this.x * this.x + this.y * this.y; }
    magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { let magnitude = this.magnitude(); return new Vec2(this.x / magnitude, this.y / magnitude); }
    i_normalize() { let magnitude = this.magnitude(); this.x /= magnitude; this.y /= magnitude; return this; }
    set(x: Vec2) { this.x = x.x; this.y = x.y; return this; }
    set_s(x: number, y: number) { this.x = x; this.y = y; return this; }
    clamp(min: Vec2, max: Vec2) { return new Vec2(Math.min(Math.max(this.x, min.x), max.x), Math.min(Math.max(this.y, min.y), max.y)); }
    i_clamp(min: Vec2, max: Vec2) { this.x = Math.min(Math.max(this.x, min.x), max.x); this.y = Math.min(Math.max(this.y, min.y), max.y); return this; }
    copy() { return new Vec2(this.x, this.y); }
}

export class Rectangle {
    constructor(public pos: Vec2, public size: Vec2) { }

    copy() {
        return new Rectangle(this.pos.copy(), this.size.copy());
    }

    br(): Vec2 {
        return new Vec2(this.pos.x + this.size.x, this.pos.y + this.size.y);
    }

    clamp(other: Rectangle) {
        if (this.pos.x < other.pos.x) { this.pos.x = other.pos.x; }
        if (this.pos.y < other.pos.y) { this.pos.y = other.pos.y; }
        if (this.pos.x + this.size.x > other.pos.x + other.size.x) { this.pos.x = other.pos.x + other.size.x - this.size.x; }
        if (this.pos.y + this.size.y > other.pos.y + other.size.y) { this.pos.y = other.pos.y + other.size.y - this.size.y; }
    }
}

export class Circle {
    constructor(public pos: Vec2, public radius: number) { }

    collidesRectange(rect: Rectangle) {
        var distX = Math.abs(this.pos.x - rect.pos.x - rect.size.x / 2);
        var distY = Math.abs(this.pos.y - rect.pos.y - rect.size.y / 2);

        if (distX > (rect.size.x / 2 + this.radius)) { return false; }
        if (distY > (rect.size.y / 2 + this.radius)) { return false; }

        if (distX <= (rect.size.x / 2)) { return true; }
        if (distY <= (rect.size.y / 2)) { return true; }

        var dx = distX - rect.size.x / 2;
        var dy = distY - rect.size.y / 2;
        return (dx * dx + dy * dy <= (this.radius * this.radius));
    }
}

export class Color {
    constructor(public r: number, public g: number, public b: number) { }

    lerp(x: Color, t: number) {
        return new Color(lerp(this.r, x.r, t), lerp(this.g, x.g, t), lerp(this.b, x.b, t));
    }

    toColorString() {
        return `rgb(${this.r},${this.g},${this.b})`;
    }
}

/** OBB Intersection Algorithm
 *  src: https://www.flipcode.com/archives/2D_OBB_Intersection.shtml
 */
export class OBB2D {

    /** Corners of the box, where 0 is the lower left. */
    corner: Vec2[] = [new Vec2(0, 0), new Vec2(0, 0), new Vec2(0, 0), new Vec2(0, 0)];

    /** Two edges of the box extended away from corner[0]. */
    axis: Vec2[] = [new Vec2(0, 0), new Vec2(0, 0)];

    /** origin[a] = corner[0].dot(axis[a]); */
    origin: number[] = [0];

    constructor(center: Vec2, size: Vec2, angle: number) {
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
    private overlaps1Way(other: OBB2D): boolean {
        for (let a = 0; a < 2; ++a) {
            let t = other.corner[0].dot(this.axis[a]);

            // Find the extent of box 2 on axis a
            let tMin = t;
            let tMax = t;

            for (let c = 1; c < 4; ++c) {
                t = other.corner[c].dot(this.axis[a]);

                if (t < tMin) {
                    tMin = t;
                } else if (t > tMax) {
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
    private computeAxes(): void {
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
    public moveTo(center: Vec2): void {
        let centroid = this.corner[0].add(this.corner[1]).i_add(this.corner[2]).i_add(this.corner[3]).i_div_s(4);
        let translation = center.sub(centroid);

        for (let c = 0; c < 4; ++c) {
            this.corner[c].i_add(translation);
        }

        this.computeAxes();
    }

    /** Returns true if the intersection of the boxes is non-empty. */
    public overlaps(other: OBB2D): boolean {
        return this.overlaps1Way(other) && other.overlaps1Way(this);
    }
}

export function random() { return ((Math.random() - 0.5) * 2); }
export function lerp(min: number, max: number, t: number) { return min + (max - min) * t; }

// Easing functions
export function bezierBlend(t: number) { return t * t * (3.0 - 2.0 * t); }
export function easeIn(t: number) { return 2.0 * t * t; }
export function easeOut(t: number) { return 2.0 * t * (1.0 - t) + 0.5; }
export function parametricBlend(t: number) { let sqt = t * t; return sqt / (2.0 * (sqt - t) + 1.0); }
export function inOutQuadBlend(t: number) { if (t <= 0.5) return 2.0 * t * t; t -= 0.5; return 2.0 * t * (1.0 - t) + 0.5; }

