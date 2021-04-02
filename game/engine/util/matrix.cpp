#ifndef MATRIX_H
#define MATRIX_H

#include <string.h>
#include "./vector.cpp";

class Mat3
{
  private:
    double _array[9];

  public:
    double *array() { return this->_array; }

    Mat3() { memset(this->_array, 0, sizeof(double) * 9); }
    Mat3(double array[9]) { memcpy(this->_array, array, sizeof(double) * 9); }

    // Matrix operations
    Mat3 operator+(const Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp._array[i] = this->_array[i] + x._array[i];
        return temp;
    }

    Mat3 operator-(const Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp._array[i] = this->_array[i] - x._array[i];
        return temp;
    }

    Mat3 operator/(const Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp._array[i] = this->_array[i] / x._array[i];
        return temp;
    }

    Mat3 operator*(const Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp._array[i] = this->_array[i] * x._array[i];
        return temp;
    }

    // mul(x: Mat3) {
    //     let temp: number[] = [];
    //     for (let i = 0; i < 3; i++) {
    //         for (let j = 0; j < 3; j++) {
    //             let sum = 0;
    //             for (let k = 0; k < 3; k++) sum += this->_array[i * 3 + k] * x.array[k * 3 + j];
    //             temp.push(sum);
    //         }
    //     }
    //     return new Mat3(temp);
    // }

    Vec2 operator*(const Vec2 &x) { return Vec2(this->_array[0] * x.x + this->_array[1] * x.y + this->_array[2], this->_array[3] * x.x + this->_array[4] * x.y + this->_array[5]); }

    // Scalar operations
    Mat3 operator+(double x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp._array[i] = this->_array[i] + x;
        return temp;
    }

    Mat3 operator-(double x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp._array[i] = this->_array[i] - x;
        return temp;
    }

    Mat3 operator/(double x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp._array[i] = this->_array[i] / x;
        return temp;
    }

    Mat3 operator*(double x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp._array[i] = this->_array[i] * x;
        return temp;
    }

    // MISC
    // clamp(min: number, max: number) {
    //     let temp: number[] = [];
    //     for (let i = 0; i < 9; i++) temp.push(Math.min(Math.max(this->_array[i], min), max));
    //     return new Mat3(temp);
    // }
    // copy() { return new Mat3([...this->_array]); }
    double get_rotation() { return fmod((atan2(this->_array[3], this->_array[4]) + M_PI * 2), (M_PI * 2)); }
    const Vec2 get_scale()
    {
        return Vec2(sqrt(this->_array[0] * this->_array[0] + this->_array[3] * this->_array[3]),
                    sqrt(this->_array[1] * this->_array[1] + this->_array[4] * this->_array[4]));
    }
    const Vec2 get_translation() { return Vec2(this->_array[2], this->_array[5]); }
    // toCanvasTransform() { return [this->_array[0], this->_array[3], this->_array[1], this->_array[4], this->_array[2], this->_array[5]] }

    // Mat3 inverse() {
    //     Vec2 scale = this->get_scale();
    //     // TODO: Calculate static inverse
    //     return Mat3.create_scale(Vec2.one().div(scale))
    //         .mul(Mat3.create_rotation(-this->get_rotation()))
    //         .mul(Mat3.create_translation(this->get_translation().mul_s(-1)));
    // }

    // static Mat3 zero() { return Mat3([0, 0, 0, 0, 0, 0, 0, 0, 0]); }
    // static Mat3 one() { return Mat3([1, 1, 1, 1, 1, 1, 1, 1, 1]); }
    // static Mat3 identity() { return Mat3([1, 0, 0, 0, 1, 0, 0, 0, 1]); }
    // static create_translation(translation: Vec2) { return new Mat3([1, 0, translation.x, 0, 1, translation.y, 0, 0, 1]); }
    // static create_scale(scale: Vec2) { return new Mat3([scale.x, 0, 0, 0, scale.y, 0, 0, 0, 1]); }
    // static create_rotation(rotation: number) {
    //     let c = Math.cos(rotation); let s = Math.sin(rotation);
    //     return new Mat3([c, -s, 0, s, c, 0, 0, 0, 1]);
    // }
    // static create_transformation(translation: Vec2, scale: Vec2, rotation: number) {
    //     return Mat3.create_translation(translation).mul(Mat3.create_rotation(rotation)).mul(Mat3.create_scale(scale));
    // }
};

#endif