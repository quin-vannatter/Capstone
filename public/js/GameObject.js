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
    constructor(texture, x, y, width, height, speed, rotation) {
		
		// Set the texture as an image.
		this.texture = new Image();
		this.texture.src = texture;
		
		// Set the speed of the game object.
		this.speed = speed;
		
		// Set the location and size.
		this.loc = {
			x: x,
			y: y
		};
		
		this.size = {
			width: width,
			height: height
		};
		
		this.speed = speed;
		this.rotation = rotation;
		
		this.velocity = {
			x: 0,
			y: 0
		};
    }
	
	// Getters for a game object.
	setVel(velocity) {
		this.velocity.x = velocity.x;
		this.velocity.y = velocity.y;
	}
	
	getTex() {
		return this.texture;
	}
	
	getLoc() {
		return this.loc;
	}
	
	setSize(value) {
		this.size = value;
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
}

//module.exports = GameObject;