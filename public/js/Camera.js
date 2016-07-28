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
			width: canvas.width/2,
			height: canvas.height/2
		};
    }
	
	getFocus() {
		return this.focus;
	}
	
	update() {
		this.loc.x += (this.focus.getLoc().x - this.loc.x)/20;
		this.loc.y += (this.focus.getLoc().y - this.loc.y)/20;
	}
	
	calculateLoc(obj) {
		return {
			x: obj.getLoc().x - this.loc.x + this.center.width,
			y: obj.getLoc().y - this.loc.y + this.center.height
		}
	}
}

//module.exports = GameObject;