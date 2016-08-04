/* Camera.js
 * Used as a dynamic camera for the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class Camera extends GameObject {
	
	// Constructor for a game object.
    constructor(focus, canvas) {
		
		// Set the location and size.
		var location = {
			x: focus.getLoc().x,
			y: focus.getLoc().y
		};
		
        super(null, location, {width: 0, height: 0}, 0, Vector.zero(), 0);
		
		// Set the focus.
		this.CAMERA_SPEED = 10;
		this.focus = focus;
		this.canvas = canvas;
		this.center = {
			width: this.canvas.width/2 - this.focus.getSize().width/2,
			height: this.canvas.height/2 - this.focus.getSize().height/2
		};
    }
	
	getLoc() {
		return this.loc;
	}
	
	getFocus() {
		return this.focus;
	}
	
	setFocus(focus) {
		this.focus = focus;
	}
	
	update() {
		this.loc.x += ((this.focus.getLoc().x - this.center.width) - this.loc.x)/this.CAMERA_SPEED;
		this.loc.y += ((this.focus.getLoc().y - this.center.height) - this.loc.y)/this.CAMERA_SPEED;
		
	}
	
	reCenter() {
		this.center = {
			width: this.canvas.width/2 - this.focus.getSize().width/2,
			height: this.canvas.height/2 - this.focus.getSize().height/2
		};
	}
	
	calculateOffset(obj) {
		return {
			x: obj.getMoveLoc().x - this.loc.x,
			y: obj.getMoveLoc().y - this.loc.y
		}
	}
}

//module.exports = GameObject;