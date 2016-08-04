(function(exports) {
    var GameObject = require('./GameObject.js');

    function Block() {
        GameObject.super_.apply(this, arguments);
    }

    /**
     * The game instance that's shared across all clients and the server.
     */
    var Block = function() {
        this.gameObjects = [];
    };

    Block.super_ = GameObject;

    GameObject.prototype = Object.create(GameObject.prototype, {
        constructor: {
            value: Block,
            enumerable: false
        }
    });




    // Rate (in milliseconds) at which the game updates.
    Game.UPDATE_INTERVAL = 1000 / 60;
    //Game.UPDATE_INTERVAL = 1000;

    /**
     * Loops through all objects and updates their properties based on
     * collision.
     */
    Game.prototype.update = function() {
        this.updateObjects();
        //this.checkAllCollisions();
    };

    exports.Block = Block;
})(typeof global === 'undefined' ? window : exports);