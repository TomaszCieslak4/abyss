#ifndef SCRIPT_H
#define SCRIPT_H

#include "./camera.cpp";
#include "./gameObject.cpp";
#include "../physics/collider.cpp";
#include "../physics/rigidbody.cpp";
#include "../physics/collision.cpp";

class Script
{
  private:
    bool enabled;
    GameObject *gameObject;

  public:
    Script(GameObject *gameObject)
    {
        this->gameObject = gameObject;
        this->enabled = true;
    }
    virtual void update() {}
    virtual void fixedUpdate() {}
    virtual void start() {}
    virtual void onCollisionEnter(Collision collision) {}
    virtual void onTriggerEnter(Collision collision) {}
    virtual void onCollisionStay(Collision collision) {}
    virtual void onTriggerStay(Collision collision) {}
    virtual void onCollisionExit(Collider collider, GameObject gameObject) {}
    virtual void onTriggerExit(Collider collider, GameObject gameObject) {}
    virtual void onDestroy() {}
};

#endif
