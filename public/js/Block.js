'use strict';

class Block extends GameObject {
    constructor(location, size) {
		const TEXTURE = 'img/block.png';
		
        super(TEXTURE, location, size.width, size.height, 0, Vector.zero(), true);
        this.pattern = true;
    }

    toTransit() {
        return {
            type: 'Block',
            loc: this.loc,
            size: this.size
        }
    }
}

if (typeof global !== 'undefined') {
    module.exports = Block;
}