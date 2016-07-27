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
    constructor(texture, x, y, width, height, speed) {
		
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
		
		this.speed = 0;
		
		this.velocity = {
			x: 0,
			y: 0
		};
    }
	
	// Getters for a game object.
	setVel(velocity) {
		this.velocity = velocity;
	}
	
	getTex() {
		return this.texture;
	}
	
	getLoc() {
		return this.loc;
	}
	
	getSize() {
		return this.size;
	}
}

//module.exports = GameObject;