'use strict';

var GameObject = require('./game-object.js');

class Player extends GameObject {
    constructor(x, y, id, name) {
        super(x, y);

        this.id = id;
        this.name = name;
    }

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }
}

module.exports = Player;