import { Vec2 } from "./vector.js";

export class Mat3 {
    private _array: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    public get array(): number[] { return this._array; }
    constructor(array: number[]) { this._array = [...array]; }

    // Matrix operations
    add(x: Mat3) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(this.array[i] + x.array[i]);
        return new Mat3(temp);
    }

    sub(x: Mat3) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(this.array[i] - x.array[i]);
        return new Mat3(temp);
    }

    elm_div(x: Mat3) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(this.array[i] / x.array[i]);
        return new Mat3(temp);
    }

    elm_mul(x: Mat3) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(this.array[i] * x.array[i]);
        return new Mat3(temp);
    }

    mul(x: Mat3) {
        let temp: number[] = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let sum = 0;
                for (let k = 0; k < 3; k++) sum += this.array[i * 3 + k] * x.array[k * 3 + j];
                temp.push(sum);
            }
        }
        return new Mat3(temp);
    }

    mul_vec2(x: Vec2) { return new Vec2(this.array[0] * x.x + this.array[1] * x.y + this.array[2], this.array[3] * x.x + this.array[4] * x.y + this.array[5]); }

    // Scalar operations
    add_s(x: number) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(this.array[i] + x);
        return new Mat3(temp);
    }

    sub_s(x: number) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(this.array[i] - x);
        return new Mat3(temp);
    }

    div_s(x: number) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(this.array[i] / x);
        return new Mat3(temp);
    }

    mul_s(x: number) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(this.array[i] * x);
        return new Mat3(temp);
    }
    // MISC
    clamp(min: number, max: number) {
        let temp: number[] = [];
        for (let i = 0; i < 9; i++) temp.push(Math.min(Math.max(this.array[i], min), max));
        return new Mat3(temp);
    }
    copy() { return new Mat3([...this.array]); }
    get_rotation() { return (Math.atan2(this.array[3], this.array[4]) + Math.PI * 2) % (Math.PI * 2); }
    get_scale() {
        return new Vec2(Math.sqrt(this.array[0] * this.array[0] + this.array[3] * this.array[3]),
            Math.sqrt(this.array[1] * this.array[1] + this.array[4] * this.array[4]));
    }
    get_translation() { return new Vec2(this.array[2], this.array[5]); }
    toCanvasTransform() { return [this.array[0], this.array[3], this.array[1], this.array[4], this.array[2], this.array[5]] }

    inverse() {
        let scale = this.get_scale();
        // TODO: Calculate static inverse
        return Mat3.create_scale(Vec2.one().div(scale))
            .mul(Mat3.create_rotation(-this.get_rotation()))
            .mul(Mat3.create_translation(this.get_translation().mul_s(-1)));
    }

    static zero() { return new Mat3([0, 0, 0, 0, 0, 0, 0, 0, 0]); }
    static one() { return new Mat3([1, 1, 1, 1, 1, 1, 1, 1, 1]); }
    static identity() { return new Mat3([1, 0, 0, 0, 1, 0, 0, 0, 1]); }
    static create_translation(translation: Vec2) { return new Mat3([1, 0, translation.x, 0, 1, translation.y, 0, 0, 1]); }
    static create_scale(scale: Vec2) { return new Mat3([scale.x, 0, 0, 0, scale.y, 0, 0, 0, 1]); }
    static create_rotation(rotation: number) {
        let c = Math.cos(rotation); let s = Math.sin(rotation);
        return new Mat3([c, -s, 0, s, c, 0, 0, 0, 1]);
    }
    static create_transformation(translation: Vec2, scale: Vec2, rotation: number) {
        return Mat3.create_translation(translation).mul(Mat3.create_rotation(rotation)).mul(Mat3.create_scale(scale));
    }
}