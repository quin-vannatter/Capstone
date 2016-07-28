/* Camera.js
 * Used as a dynamic camera for the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class Camera {
	
	// Constructor for a game object.
    constructor(focus, canvas) {
		
		// Set the location and size.
		this.loc = {
			x: focus.getLoc().x,
			y: focus.getLoc().y
		};
		
		// Set the focus.
		this.focus = focus;
		this.center = {
			width: canvas.width/2 - focus.getSize().width/2,
			height: canvas.height/2 - focus.getSize().height/2
		};
		
		this.CAMERA_SPEED = 10;
    }
	
	getFocus() {
		return this.focus;
	}
	
	setFocus(focus) {
		this.focus = focus;
	}
	
	update() {
		this.loc.x += (this.focus.getLoc().x - this.loc.x)/this.CAMERA_SPEED;
		this.loc.y += (this.focus.getLoc().y - this.loc.y)/this.CAMERA_SPEED;
	}
	
	calculateLoc(obj) {
		return {
			x: obj.getLoc().x - this.loc.x + this.center.width,
			y: obj.getLoc().y - this.loc.y + this.center.height
		}
	}
}

//module.exports = GameObject;