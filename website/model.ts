import { Actor } from "./actor.js";
import { Player } from "./player.js";
import { Vec2, OBB2D, Color } from "./util.js";

function randint(n: number) { return Math.round(Math.random() * n); }
function rand(n: number) { return Math.random() * n; }

export class Stage {
	// all actors on this stage (monsters, player, boxes, ...)
	actors: Actor[] = [];
	// a special actor, the player
	player: Player | null = null;
	width: number;
	height: number;

	constructor(public canvas: HTMLCanvasElement) {
		let box = new OBB2D(new Vec2(0, 0), new Vec2(10, 10), 0);
		let box2 = new OBB2D(new Vec2(10.1, 0), new Vec2(10, 10), 45);
		console.log(box.overlaps(box2));

		// the logical width and height of the stage
		this.width = canvas.width;
		this.height = canvas.height;

		// Add the player to the center of the stage
		this.addPlayer(new Player(this,
			new Vec2(Math.floor(this.width / 2),
				Math.floor(this.height / 2)),
			new Vec2(0, 0),
			new Color(0, 0, 0, 1),
			20));

		// Add in some Balls
		let total = 100;
		while (total > 0) {
			let x = Math.floor((Math.random() * this.width));
			let y = Math.floor((Math.random() * this.height));
			if (this.getActor(x, y) === null) {
				this.addActor(new Actor(this,
					new Vec2(x, y),
					new Vec2(rand(20), rand(20)),
					new Color(randint(255), randint(255), randint(255), Math.random()),
					randint(20)));
				total--;
			}
		}
	}

	addPlayer(player: Player) {
		this.addActor(player);
		this.player = player;
	}

	removePlayer() {
		if (!this.player) return;
		this.removeActor(this.player);
		this.player = null;
	}

	addActor(actor: Actor) {
		this.actors.push(actor);
	}

	removeActor(actor: Actor) {
		let index = this.actors.indexOf(actor);
		if (index != -1) {
			this.actors.splice(index, 1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	update(dt: number) {
		for (let i = 0; i < this.actors.length; i++) {
			this.actors[i].update(dt);
		}
	}

	fixedUpdate() {
		for (let i = 0; i < this.actors.length; i++) {
			this.actors[i].fixedUpdate();
		}
	}

	draw() {
		let context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		context.clearRect(0, 0, this.width, this.height);
		for (let i = 0; i < this.actors.length; i++) {
			this.actors[i].draw(context);
		}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x: number, y: number) {
		for (let i = 0; i < this.actors.length; i++) {
			if (this.actors[i].position.x == x && this.actors[i].position.y == y) {
				return this.actors[i];
			}
		}
		return null;
	}
}