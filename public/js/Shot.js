/* Player.js
 * The class for a player of the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class Shot extends GameObject {
	
    constructor(sourceObj, destination) {
		const TEXTURE = 'shot.png';
		const SIZE = {
			width: 10,
			height: 10
		};
		const SPEED = 7;
		const MAX_DISTANCE = 9000000000000000000;
		
		var srcLoc = sourceObj.getLoc();
		var loc = {
			x: srcLoc.x + sourceObj.getSize().width / 2,
			y: srcLoc.y + sourceObj.getSize().height / 2
		};
		
		var vector = Vector.normalize(Vector.delta(destination, loc));
		var velocity = Vector.multiply(vector, SPEED);
		loc = Vector.add(loc,velocity);
        super(TEXTURE, loc, SIZE, SPEED, velocity, 0, true);
		
		this.owner = sourceObj;
		this.distance = MAX_DISTANCE;
    }
	
	update() {
		super.move();
		
		this.distance -= this.speed;
		if(this.distance <= 0) { this.destroy = true; }
	}
	
	getOwner() {
		return this.owner;
	}
}