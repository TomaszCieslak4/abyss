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

    // MISC
    dot(x: Vec2) { return this.x * x.x + this.y * x.y; }
    prep() { return new Vec2(-this.y, this.x); }
    sqr_dist(x: Vec2) { let dx = this.x - x.x; let dy = this.y - x.y; return dx * dx + dy * dy; }
    sqr_magnitude() { return this.x * this.x + this.y * this.y; }
    magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }
    normalize() { let magnitude = this.magnitude(); return new Vec2(this.x / magnitude, this.y / magnitude); }
    clamp(min: Vec2, max: Vec2) { return new Vec2(Math.min(Math.max(this.x, min.x), max.x), Math.min(Math.max(this.y, min.y), max.y)); }
    copy() { return new Vec2(this.x, this.y); }
    get_angle() { return (Math.atan2(this.y, this.x) + Math.PI * 2) % (Math.PI * 2); }

    static lerp(start: Vec2, end: Vec2, t: number) { return start.add(end.sub(start).mul_s(t)); }
    static zero() { return new Vec2(0, 0); }
    static one() { return new Vec2(1, 1); }
    static from_angle(angle: number) { return new Vec2(Math.cos(angle), Math.sin(angle)); }
}