import { Actor } from "./actor.js";
export class Player extends Actor {
    draw(context) {
        context.fillStyle = this.colour.toColorString();
        context.fillRect(this.position.x, this.position.y, this.radius, this.radius);
        /**
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        context.stroke();
        **/
    }
}
