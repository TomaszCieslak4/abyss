import { Stage } from "./model.js";
import { Vec2 } from "./util.js";

export class Actor {
    isStatic: boolean = false;

    constructor(
        public stage: Stage,
        public position: Vec2,
        public velocity: Vec2,
        public colour: string,
        public radius: number
    ) { }

    headTo(position: Vec2) {
        this.velocity = position.sub(this.position).normalize();
    }

    update(dt: number) {

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

    draw(context: CanvasRenderingContext2D) {
        context.fillStyle = this.colour;
        // context.fillRect(this.x, this.y, this.radius,this.radius);
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
        context.fill();
    }
}