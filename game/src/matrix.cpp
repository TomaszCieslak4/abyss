#ifndef MATRIX_H
#define MATRIX_H

#include <array>
#include "vec2.cpp"

class Mat3
{
  public:
    std::array<double, 9> array;

    Mat3() { this->array.fill(0); }
    Mat3(std::array<double, 9> array) { this->array = array; }

    // Matrix operations
    Mat3 operator+(Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp.array[i] = this->array[i] + x.array[i];
        return temp;
    }

    Mat3 operator-(Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp.array[i] = this->array[i] - x.array[i];
        return temp;
    }

    Mat3 operator/(Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp.array[i] = this->array[i] / x.array[i];
        return temp;
    }

    Mat3 operator*(Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 3; i++)
        {
            for (int j = 0; j < 3; j++)
            {
                double sum = 0;
                for (int k = 0; k < 3; k++) sum += this->array[i * 3 + k] * x.array[k * 3 + j];
                temp.array[i * 3 + j] = sum;
            }
        }
        return temp;
    }

    Mat3 operator*(const Mat3 &x)
    {
        Mat3 temp;
        for (int i = 0; i < 3; i++)
        {
            for (int j = 0; j < 3; j++)
            {
                double sum = 0;
                for (int k = 0; k < 3; k++) sum += this->array[i * 3 + k] * x.array[k * 3 + j];
                temp.array[i * 3 + j] = sum;
            }
        }
        return temp;
    }

    Vec2 operator*(const Vec2 &x)
    {
        return Vec2(this->array[0] * x.x + this->array[1] * x.y + this->array[2],
                    this->array[3] * x.x + this->array[4] * x.y + this->array[5]);
    }

    // Scalar operations
    Mat3 operator+(double x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp.array[i] = this->array[i] + x;
        return temp;
    }
    Mat3 operator-(double x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp.array[i] = this->array[i] - x;
        return temp;
    }
    Mat3 operator/(double x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp.array[i] = this->array[i] / x;
        return temp;
    }
    Mat3 operator*(double x)
    {
        Mat3 temp;
        for (int i = 0; i < 9; i++) temp.array[i] = this->array[i] * x;
        return temp;
    }

    // MISC
    double get_rotation() { return fmod((atan2(this->array[3], this->array[4]) + M_PI * 2), (M_PI * 2)); }
    Vec2 get_scale()
    {
        return Vec2(sqrt(this->array[0] * this->array[0] + this->array[3] * this->array[3]),
                    sqrt(this->array[1] * this->array[1] + this->array[4] * this->array[4]));
    }
    Vec2 get_translation() { return Vec2(this->array[2], this->array[5]); }

    Mat3 inverse()
    {
        Mat3 identity = Mat3::identity();
        Mat3 translate = Mat3::translate(identity, this->get_translation() * -1.0);
        Mat3 rotate = Mat3::rotate(translate, -this->get_rotation());
        return Mat3::scale(rotate, Vec2::one() / this->get_scale());
    }

    static Mat3 zero() { return Mat3({0, 0, 0, 0, 0, 0, 0, 0, 0}); }
    static Mat3 one() { return Mat3({1, 1, 1, 1, 1, 1, 1, 1, 1}); }
    static Mat3 identity() { return Mat3({1, 0, 0, 0, 1, 0, 0, 0, 1}); }
    static Mat3 translate(Mat3 &mat, const Vec2 &translation) { return Mat3({1, 0, translation.x, 0, 1, translation.y, 0, 0, 1}) * mat; }
    static Mat3 scale(Mat3 &mat, const Vec2 &scale) { return Mat3({scale.x, 0, 0, 0, scale.y, 0, 0, 0, 1}) * mat; }
    static Mat3 rotate(Mat3 &mat, double rotation)
    {
        double c = cos(rotation);
        double s = sin(rotation);
        return Mat3({c, -s, 0, s, c, 0, 0, 0, 1}) * mat;
    }
};

#endif