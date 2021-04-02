#ifndef TRANSFORM_H
#define TRANSFORM_H

#include "./gameObject.cpp";
#include "./sceneManager.cpp";
#include "./script.cpp";
#include "../util/matrix.cpp";
#include "../util/util.cpp";
#include "../util/vector.cpp";

class Transform : public Script
{
  private:
    Vec2 _localPosition;
    Vec2 _localScale;
    double _localRotation = 0;
    Mat3 _objectToWorld;
    bool dirty = true;
    Transform *_parent = nullptr;
    std::vector<Transform> _children;

  public:
    const Vec2 &localPosition() { return this->_localPosition; }
    void setLocalPosition(const Vec2 &value)
    {
        this->_localPosition = value;
        this->dirty = true;
        for (auto child : this->children()) child.setLocalPosition(child.localPosition());
    }

    const Vec2 &localScale() { return this->_localScale; }
    void setLocalScale(const Vec2 &value)
    {
        this->_localScale = value;
        this->dirty = true;
        for (auto child : this->children()) child.setLocalScale(child.localScale());
    }

    double localRotation() { return this->_localRotation; }
    void setLocalRotation(double value)
    {
        value = clampAngle(value);
        this->_localRotation = value;
        this->dirty = true;
        for (auto child : this->children()) child.setLocalRotation(child.localRotation());
    }

    const Mat3 &objectToWorld()
    {
        if (this->dirty)
        {
            // this->_objectToWorld = Mat3.create_transformation(this->localPosition, this->localScale, this->localRotation);
            if (this->parent())
            {
                Mat3 trans = this->parent()->objectToWorld();
                this->_objectToWorld = trans * this->_objectToWorld;
            }
            this->dirty = false;
        }
        return this->_objectToWorld;
    }

    const Vec2 position()
    {
        Vec2 x = this->objectToWorld().get_translation();
        return this->parent() ? x : this->localPosition();
    }

    void setPosition(Vec2 &value)
    {
        if (this->parent())
        {
            // this->setLocalPosition(this->parent()->objectToWorld().inverse() * value);
            return;
        }
        this->setLocalPosition(value);
    }

    Vec2 scale() { return this->parent() ? this->objectToWorld().get_scale() : this->localScale(); }
    void setScale(Vec2 &value)
    {
        if (this->parent())
        {
            this->setLocalScale(this->parent()->objectToWorld().get_scale() / value);
            return;
        }
        this->setLocalScale(value);
    }

    double rotation() { return this->parent() ? this->objectToWorld().get_rotation() : this->localRotation(); }
    void setRotation(double value)
    {
        value = clampAngle(value);
        if (this->parent())
        {
            this->setLocalRotation(clampAngle(value - this->parent()->objectToWorld().get_rotation()));
            return;
        }
        this->setLocalRotation(value);
    }

    Transform &root() { return this->parent == null ? this : this->parent.root; }
    Vec2 forward() { return Vec2.from_angle(this->objectToWorld.get_rotation()); }
    void setForward(Vec2 value) { this->rotation() = value.get_angle(); }

    Transform *parent() { return this->_parent; }
    void setParent(Transform *value)
    {
        if (this->_parent) this->_parent->removeChild(*this);
        if (value) value->addChild(*this);
    }

    std::vector<Transform> &children() { return this->_children; }

    void removeChild(Transform &transform)
    {
        for (int i = 0; i < this->children().size(); i++)
        {
            if (&this->children()[i] == &transform)
            {
                Vec2 position = transform.position();
                double rotation = transform.rotation();
                Vec2 scale = transform.scale();

                this->children.splice(i, 1);
                transform._parent = null;
                SceneManager.activeScene.gameObjects.push(transform.gameObject);

                transform.position = position;
                transform.rotation = rotation;
                transform.scale = scale;
                break;
            }
        }
    }

    // setSiblingIndex(index: number) {
    //     if (this->parent) {
    //         for (let i = 0; i < this->parent.children.length; i++) {
    //             if (this->parent.children[i] === this) {
    //                 this->parent.children.splice(i, 1);
    //             }
    //         }
    //         index = clamp(index, 0, this->parent.children.length);
    //         this->parent.children.splice(index, 0, this);
    //         return;
    //     }

    //     for (let i = 0; i < SceneManager.activeScene.gameObjects.length; i++) {
    //         if (SceneManager.activeScene.gameObjects[i].transform === this) {
    //             SceneManager.activeScene.gameObjects.splice(i, 1);
    //         }
    //     }

    //     index = clamp(index, 0, SceneManager.activeScene.gameObjects.length);
    //     SceneManager.activeScene.gameObjects.splice(index, 0, this->gameObject);
    // }

    // getSiblingIndex(index: number) {
    //     if (this->parent) {
    //         for (let i = 0; i < this->parent.children.length; i++) {
    //             if (this->parent.children[i] === this) {
    //                 return i
    //             }
    //         }

    //         return -1;
    //     }

    //     for (let i = 0; i < SceneManager.activeScene.gameObjects.length; i++) {
    //         if (SceneManager.activeScene.gameObjects[i].transform === this) {
    //             return i
    //         }
    //     }

    //     return -1;
    // }

    // addChild(transform: Transform, index: number = -1) {
    //     if (transform._parent) {
    //         transform._parent.removeChild(this);
    //     } else {
    //         for (let i = 0; i < SceneManager.activeScene.gameObjects.length; i++) {
    //             if (SceneManager.activeScene.gameObjects[i] === transform.gameObject) {
    //                 SceneManager.activeScene.gameObjects.splice(i, 1);
    //             }
    //         }
    //     }

    //     let position = transform.position;
    //     let rotation = transform.rotation;
    //     let scale = transform.scale;

    //     if (index > this->_children.length) index = this->_children.length;
    //     if (index < 0) index = this->_children.length;

    //     this->_children.splice(index, 0, transform);
    //     transform._parent = this;

    //     transform.position = position;
    //     transform.rotation = rotation;
    //     transform.scale = scale;
    // }
};

#endif