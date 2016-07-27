'use strict';

class GameObject {
    constructor(x, y) {
        this.location = {
            x: x,
            y: y
        }
    }

    getLocation() {
        return this.location;
    }
}

module.exports = GameObject;