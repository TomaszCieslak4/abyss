export class Vec2 {
    constructor(x = 0, y = 0) {
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
    prep() { return new Vec2(-this.y, this.x); }
    i_prep() { let x = this.x; let y = this.y; this.x = -y; this.y = x; return this; }
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
    static lerp(start, end, t) { return start.add(end.sub(start).i_mul_s(t)); }
    static zero() { return new Vec2(0, 0); }
    static one() { return new Vec2(1, 1); }
}
