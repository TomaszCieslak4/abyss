function randint(n: number) { return Math.round(Math.random() * n); }
function rand(n: number) { return Math.random() * n; }

export class Stage {
	actors: Ball[];
	canvas: any;
	player: Player | null;
	width: any;
	height: any;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;

		this.actors = []; // all actors on this stage (monsters, player, boxes, ...)
		this.player = null; // a special actor, the player

		// the logical width and height of the stage
		this.width = canvas.width;
		this.height = canvas.height;

		// Add the player to the center of the stage
		var velocity = new Pair(0, 0);
		var radius = 20;
		var colour = 'rgba(0,0,0,1)';
		var position = new Pair(Math.floor(this.width / 2), Math.floor(this.height / 2));
		this.addPlayer(new Player(this, position, velocity, colour, radius));

		// Add in some Balls
		var total = 100;
		while (total > 0) {
			var x = Math.floor((Math.random() * this.width));
			var y = Math.floor((Math.random() * this.height));
			if (this.getActor(x, y) === null) {
				var velocity = new Pair(rand(20), rand(20));
				var red = randint(255), green = randint(255), blue = randint(255);
				var radius = randint(20);
				var alpha = Math.random();
				var colour = 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
				var position = new Pair(x, y);
				var b = new Ball(this, position, velocity, colour, radius);
				this.addActor(b);
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

	addActor(actor: Ball) {
		this.actors.push(actor);
	}

	removeActor(actor: Ball) {
		var index = this.actors.indexOf(actor);
		if (index != -1) {
			this.actors.splice(index, 1);
		}
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step() {
		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].step();
		}
	}

	draw() {
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		for (var i = 0; i < this.actors.length; i++) {
			this.actors[i].draw(context);
		}
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(x: number, y: number) {
		for (var i = 0; i < this.actors.length; i++) {
			if (this.actors[i].x == x && this.actors[i].y == y) {
				return this.actors[i];
			}
		}
		return null;
	}
} // End Class Stage

export class Pair {
	x: any;
	y: any;
	constructor(x: number, y: number) {
		this.x = x; this.y = y;
	}

	toString() {
		return "(" + this.x + "," + this.y + ")";
	}

	normalize() {
		var magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
		this.x = this.x / magnitude;
		this.y = this.y / magnitude;
	}
}

export class Ball {
	x: number = 0;
	y: number = 0;
	constructor(
		public stage: Stage,
		public position: Pair,
		public velocity: Pair,
		public colour: string,
		public radius: number
	) {
		this.intPosition(); // this.x, this.y are int version of this.position
	}

	headTo(position: Pair) {
		this.velocity.x = (position.x - this.position.x);
		this.velocity.y = (position.y - this.position.y);
		this.velocity.normalize();
	}

	toString() {
		return this.position.toString() + " " + this.velocity.toString();
	}

	step() {
		this.position.x = this.position.x + this.velocity.x;
		this.position.y = this.position.y + this.velocity.y;

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
		this.intPosition();
	}
	intPosition() {
		this.x = Math.round(this.position.x);
		this.y = Math.round(this.position.y);
	}

	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = this.colour;
		// context.fillRect(this.x, this.y, this.radius,this.radius);
		context.beginPath();
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
		context.fill();
	}
}

export class Player extends Ball {
	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = this.colour;
		context.fillRect(this.x, this.y, this.radius, this.radius);
		/**
		context.beginPath(); 
		context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();   
		**/
	}
}