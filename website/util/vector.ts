export class Vec2 {
    private _x: number = 0;
    private _y: number = 0;
    public get y(): number { return this._y; }
    public get x(): number { return this._x; }
    constructor(x: number, y: number) { this._x = x; this._y = y; }

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

    // // Inplace Vector operations
    // i_add(x: Vec2) { this.x += x.x; this.y += x.y; return this; }
    // i_sub(x: Vec2) { this.x -= x.x; this.y -= x.y; return this; }
    // i_div(x: Vec2) { this.x /= x.x; this.y /= x.y; return this; }
    // i_mul(x: Vec2) { this.x *= x.x; this.y *= x.y; return this; }

    // // Inplace Scalar operations
    // i_add_s(x: number) { this.x += x; this.y += x; return this; }
    // i_sub_s(x: number) { this.x -= x; this.y -= x; return this; }
    // i_div_s(x: number) { this.x /= x; this.y /= x; return this; }
    // i_mul_s(x: number) { this.x *= x; this.y *= x; return this; }

    // MISC
    dot(x: Vec2) { return this.x * x.x + this.y * x.y; }
    prep() { return new Vec2(-this.y, this.x); }
    // i_prep() { let x = this.x; let y = this.y; this.x = -y; this.y = x; return this; }
    sqr_dist(x: Vec2) { let dx = this.x - x.x; let dy = this.y - x.y; return dx * dx + dy * dy; }
    sqr_magnitude() { return this.x * this.x + this.y * this.y; }
    magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { let magnitude = this.magnitude(); return new Vec2(this.x / magnitude, this.y / magnitude); }
    // i_normalize() { let magnitude = this.magnitude(); this.x /= magnitude; this.y /= magnitude; return this; }
    // set(x: Vec2) { this.x = x.x; this.y = x.y; return this; }
    // set_s(x: number, y: number) { this.x = x; this.y = y; return this; }
    clamp(min: Vec2, max: Vec2) { return new Vec2(Math.min(Math.max(this.x, min.x), max.x), Math.min(Math.max(this.y, min.y), max.y)); }
    // i_clamp(min: Vec2, max: Vec2) { this.x = Math.min(Math.max(this.x, min.x), max.x); this.y = Math.min(Math.max(this.y, min.y), max.y); return this; }
    copy() { return new Vec2(this.x, this.y); }

    static lerp(start: Vec2, end: Vec2, t: number) { return start.add(end.sub(start).mul_s(t)); }
    static zero() { return new Vec2(0, 0); }
    static one() { return new Vec2(1, 1); }
}