/* Player.js
 * The class for a player of the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class Shot extends GameObject {
	// If 4 arguments are not provided, there should be 3.
	// In that case, srcLoc refers to the shot location,
	// and srcSize refers to the velocity. Also, the shot
	// will be an enemyshot and should be textured
	// appropriately.
    constructor(srcId, srcLoc, srcSize, destination) {
		const TEXTURE = 'img/shot.png';
		const TEXTURE2 = 'img/shot2.png';
		const SIZE = {
			width: 15,
			height: 15
		};
		const SPEED = 10;
		const MAX_DISTANCE = 900;
		const SHOT_DAMAGE = 1;

		if (arguments.length === 3) {
        	super(TEXTURE2, srcLoc, SIZE, SPEED, srcSize, true);
		} else {
			var loc = {
				x: srcLoc.x + srcSize.width / 2,
				y: srcLoc.y + srcSize.height / 2
			};
			
			var vector = Vector.normalize(Vector.delta(destination, loc));
			var velocity = Vector.multiply(vector, SPEED);
		
        	super(TEXTURE, loc, SIZE, SPEED, velocity, true);
		}
		
		this.ownerId = srcId;
		this.distance = MAX_DISTANCE;
		this.shotDamage = SHOT_DAMAGE;
		this.hitPlayer = false;
    }

	toTransit() {
		return {
			type: 'Shot',
			ownerId: this.ownerId,
			loc: this.loc,
			vel: this.velocity,
			distance: this.distance
		}
	}

	getOwnerId() {
		return this.ownerId;
	}
	
	update() {
		super.move();
		
		this.distance -= this.speed;
	}
	
	getOwner() {
		return this.owner;
	}

	getDamage() {
		return this.shotDamage;
	}

	getDistance() {
		return this.distance;
	}

	setHitPlayer(value) {
		this.hitPlayer = value;
	}

	getHitPlayer() {
		return this.hitPlayer;
	}
}

if (typeof global !== 'undefined') {
	module.exports = Shot;
}