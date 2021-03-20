export class Script {
    constructor(gameObject) {
        this.gameObject = gameObject;
        this.enabled = true;
    }
    update() { }
    fixedUpdate() { }
    start() { }
    onCollisionEnter(collision) { }
    onTriggerEnter(collision) { }
    onCollisionStay(collision) { }
    onTriggerStay(collision) { }
    onCollisionExit(collider, gameObject) { }
    onTriggerExit(collider, gameObject) { }
    onDestroy() { }
}
