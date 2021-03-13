export class Actor {
    constructor(stage, position, velocity, colour, radius) {
        this.stage = stage;
        this.position = position;
        this.velocity = velocity;
        this.colour = colour;
        this.radius = radius;
        this.isStatic = false;
    }
    headTo(position) {
        this.velocity = position.sub(this.position).normalize();
    }
    update(dt) {
    }
    fixedUpdate() {
        this.position.i_add(this.velocity);
        // bounce off the walls
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x = Math.abs(this.velocity.x);
        }
        if (this.position.x > this.stage.width) {
            this.position.x = this.stage.width;
            this.velocity.x = -Math.abs(this.velocity.x);
        }
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = Math.abs(this.velocity.y);
        }
        if (this.position.y > this.stage.height) {
            this.position.y = this.stage.height;
            this.velocity.y = -Math.abs(this.velocity.y);
        }
    }
    draw(context) {
        context.fillStyle = this.colour.toColorString();
        // context.fillRect(this.x, this.y, this.radius,this.radius);
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
    }
}
