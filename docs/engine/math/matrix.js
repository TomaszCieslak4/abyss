export class Mat3 {
    constructor(array = [0, 0, 0, 0, 0, 0, 0, 0, 0]) {
        this.array = array;
    }
    // Matrix operations
    add(x) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(this.array[i] + x.array[i]);
        return new Mat3(temp);
    }
    sub(x) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(this.array[i] - x.array[i]);
        return new Mat3(temp);
    }
    elm_div(x) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(this.array[i] / x.array[i]);
        return new Mat3(temp);
    }
    elm_mul(x) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(this.array[i] * x.array[i]);
        return new Mat3(temp);
    }
    mul(x) {
        let temp = [];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let sum = 0;
                for (let k = 0; k < 3; k++)
                    sum += this.array[i * 3 + k] * x.array[k * 3 + j];
                temp.push(sum);
            }
        }
        return new Mat3(temp);
    }
    // Scalar operations
    add_s(x) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(this.array[i] + x);
        return new Mat3(temp);
    }
    sub_s(x) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(this.array[i] - x);
        return new Mat3(temp);
    }
    div_s(x) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(this.array[i] / x);
        return new Mat3(temp);
    }
    mul_s(x) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(this.array[i] * x);
        return new Mat3(temp);
    }
    // Inplace Matrix operations
    i_add(x) { for (let i = 0; i < 9; i++)
        this.array[i] += x.array[i]; return this; }
    i_sub(x) { for (let i = 0; i < 9; i++)
        this.array[i] -= x.array[i]; return this; }
    i_elm_div(x) { for (let i = 0; i < 9; i++)
        this.array[i] /= x.array[i]; return this; }
    i_elm_mul(x) { for (let i = 0; i < 9; i++)
        this.array[i] *= x.array[i]; return this; }
    i_mul(x) {
        let temp = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++)
                temp[j] = this.array[i * 3 + j];
            for (let j = 0; j < 3; j++) {
                let sum = 0;
                for (let k = 0; k < 3; k++)
                    sum += temp[k] * x.array[k * 3 + j];
                this.array[i * 3 + j] = sum;
            }
        }
        return this;
    }
    // Inplace Scalar operations
    i_add_s(x) { for (let i = 0; i < 9; i++)
        this.array[i] += x; return this; }
    i_sub_s(x) { for (let i = 0; i < 9; i++)
        this.array[i] -= x; return this; }
    i_div_s(x) { for (let i = 0; i < 9; i++)
        this.array[i] /= x; return this; }
    i_mul_s(x) { for (let i = 0; i < 9; i++)
        this.array[i] *= x; return this; }
    // MISC
    set(x) { for (let i = 0; i < 9; i++)
        this.array[i] = x.array[i]; return this; }
    set_s(array) { for (let i = 0; i < 9; i++)
        this.array[i] = array[i]; return this; }
    clamp(min, max) {
        let temp = [];
        for (let i = 0; i < 9; i++)
            temp.push(Math.min(Math.max(this.array[i], min), max));
        return new Mat3(temp);
    }
    i_clamp(min, max) { for (let i = 0; i < 9; i++)
        this.array[i] = Math.min(Math.max(this.array[i], min), max); return this; }
    copy() { return new Mat3([...this.array]); }
    static zero() { return new Mat3([0, 0, 0, 0, 0, 0, 0, 0, 0]); }
    static one() { return new Mat3([1, 1, 1, 1, 1, 1, 1, 1, 1]); }
    static identity() { return new Mat3([1, 0, 0, 0, 1, 0, 0, 0, 1]); }
}
