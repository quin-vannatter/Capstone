/*
(function(exports) {
    var Game = function() {
        this.objects = [];
    };

    Game.UPDATE_INTERVAL = 1000 / 60;

    Game.prototype.addObject = function(newObject) {
        this.objects.push(newObject);
    };

    Game.prototype.getObjects = function() {
        return this.objects;
    };

    exports.Game = Game;
})(typeof global === 'undefined' ? window : exports);
*/



(function(exports) {
    /**
     * The game instance that's shared across all clients and the server
     */
    var Game = function() {
        this.gameObjects = [];
    };

    //Game.UPDATE_INTERVAL = 1000 / 60;
    Game.UPDATE_INTERVAL = 1000;

    Game.prototype.run = function() {
        setInterval(this.update.bind(this), Game.UPDATE_INTERVAL);
    };

    Game.prototype.update = function() {
        console.log(this.gameObjects.length);
        
        for(var i = 0; i < this.gameObjects.length; i++) {
            for(var h = 0; h < this.gameObjects.length; h++) {
                if(i !== h) {
                    this.checkCollision(this.gameObjects[i], this.gameObjects[h]);
                }
            }
        }
    };

    Game.prototype.checkCollision = function(obj1, obj2) {
        console.log(obj1);
        console.log(obj2);
    };

    Game.prototype.addObject = function(newObject) {
        this.gameObjects.push(newObject);
    };

    Game.prototype.getObjects = function() {
        return this.objects;
    };

    exports.Game = Game;
})(typeof global === 'undefined' ? window : exports);