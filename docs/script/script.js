export class Script {
    constructor(gameObject) {
        this.gameObject = gameObject;
    }
    update() { }
    fixedUpdate() { }
    start() { }
    draw(context, cam) { }
    onCollisionEnter(collision) { }
    onTriggerEnter(collision) { }
    onCollisionStay(collision) { }
    onTriggerStay(collision) { }
    onCollisionExit(collider) { }
    onTriggerExit(collider) { }
}
