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
			width: 15,
			height: 15
		};
		const SPEED = 15;
		const MAX_DISTANCE = 900;
		
		var srcLoc = sourceObj.getLoc();
		var loc = {
			x: srcLoc.x + sourceObj.getSize().width / 2,
			y: srcLoc.y + sourceObj.getSize().height / 2
		};
		
		var vector = Vector.normalize(Vector.delta(destination, loc));
		var velocity = Vector.multiply(vector, SPEED);
		
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