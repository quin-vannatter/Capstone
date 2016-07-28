/* Player.js
 * The class for a player of the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class Player extends GameObject {
	
    constructor(x, y) {
		const TEXTURE = 'player.png';
		const SIZE = 50;
		const SPEED = 5;
		
        super(TEXTURE, x, y, SIZE, SIZE, SPEED, 0);
    }
	
	setLoc(x,y) {
		this.loc.x = x;
		this.loc.y = y;
	}
	
	update() {
		this.loc.y += this.velocity.y;
		this.loc.x += this.velocity.x;
	}
}