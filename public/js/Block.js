/* Player.js
 * The class for a player of the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class Block extends GameObject {
	
    constructor(x, y) {
		const TEXTURE = 'block.png';
		const SIZE = 50;
		
        super(TEXTURE, x, y, SIZE, SIZE, 0);
    }
	
	setLoc(x,y) {
		this.loc.x = x;
		this.loc.y = y;
	}
}

// module.exports = Player;