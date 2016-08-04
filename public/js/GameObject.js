/* GameObject.js
 * An object that is drawn on the canvas.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class GameObject {
	
	// Constructor for a game object.
    constructor(texture, location, size, speed, velocity, clipping) {
		this.SMOOTH_VALUE = 4;
		this.SYNC_DISTANCE = 60;

		// Set the texture as an image.
		if (typeof global === 'undefined') {
			this.texture = new Image();
			this.texture.src = texture;
		}
		
		this.loc = {
			x: location.x,
			y: location.y
		};
		
		this.size = {
			width: size.width,
			height: size.height
		};
		
		this.speed = speed;
		
		this.velocity = {
			x: velocity.x,
			y: velocity.y
		};

		this.moveLoc = {
			x: location.x,
			y: location.y
		};
		
		this.destroy = false;
		this.alpha = 1;
		this.clipping = clipping;
    }
	
	// Getters for a game object.
	setVel(velocity) {
		this.velocity = {
			x: velocity.x,
			y: velocity.y
		};
	}
	
	getVel() {
		return this.velocity;
	}

	getAlpha() {
		return this.alpha;
	}

	setAlpha(alpha) {
		this.alpha = alpha;
	}
	
	getTex() {
		return this.texture;
	}
	
	getClipping() {
		return this.clipping;
	}
	
	getLoc() {
		return this.loc;
	}

	getMoveLoc() {
		return this.moveLoc;
	}
	
	setLoc(location) {
		this.loc = {
			x: location.x,
			y: location.y
		};
	}
	
	setSize(size) {
		this.size = {
			width: size.x,
			height: size.y
		};
	}
	
	getSize() {
		return this.size;
	}
	
	setRotatation(value) {
		this.rotation = value
	}
	
	getRotatation() {
		return this.rotation;
	}
	
	move() {
		this.loc = Vector.add(this.loc,this.velocity);
		if(Math.sqrt(Math.pow(this.loc.x - this.moveLoc.x,2) + Math.pow(this.loc.y - this.moveLoc.y,2)) > this.SYNC_DISTANCE) {
			this.moveLoc.x += (this.loc.x - this.moveLoc.x)/this.SMOOTH_VALUE;
			this.moveLoc.y += (this.loc.y - this.moveLoc.y)/this.SMOOTH_VALUE;
		} else {
			this.moveLoc = {
				x: this.loc.x,
				y: this.loc.y
			};
		}
	}

	syncLocation() {
		this.moveLoc = {
			x: this.loc.x,
			y: this.loc.y
		};
	}
	
	getDestroy() {
		return this.destroy;
	}

	setDestroy(value) {
		this.destroy = value;
	}
}

if (typeof global !== 'undefined') {
	module.exports = GameObject;
}