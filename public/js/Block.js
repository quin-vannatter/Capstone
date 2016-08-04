/* Block.js
 * The class for a player of the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

var GameObject = require('./GameObject.js');
var Vector = require('./Vector.js');


class Block extends GameObject {
    constructor(location, size) {
		const TEXTURE = 'img/block.png';
		
        super(TEXTURE, location, size, 0, Vector.zero(), 0, true);
    }
}

if (typeof global !== 'undefined') {
    module.exports = Block;
}