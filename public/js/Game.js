(function(exports) {
    /**
     * The game instance that's shared across all clients and the server.
     */
    var Game = function() {
        this.gameObjects = [];
    };

    // Rate (in milliseconds) at which the game updates.
    Game.UPDATE_INTERVAL = 1000 / 60;
    //Game.UPDATE_INTERVAL = 1000;

    /**
     * Loops through all objects and updates their properties based on
     * collision.
     */
    Game.prototype.update = function() {
        this.checkAllCollisions();

        this.updateObjects();
    };

    /**
     * Runs the update method for all game objects.
     */
    Game.prototype.updateObjects = function() {
        for(var i = this.gameObjects.length-1; i >= 0; i--) {
            var g = this.gameObjects[i];
        
			if(typeof(g.update) !== 'undefined') {
				g.update();
			}
		}
    }

    /**
     * Updates all objects that are colliding.
     */
    Game.prototype.checkAllCollisions = function() {
        console.log('Checking collision!');

        for(var i = 0; i < this.gameObjects.length; i++) {
			var type = this.gameObjects[i].constructor.name;

            // Don't check for wall collisions from the point of the wall.
            // Wall collisions will be checked from other objects.
			if (type !== 'Player' && type !== 'Shot') { continue; }

            // Loop over every non-wall object and check if it collides with
            // any other object (including walls).
            for(var h = 0; h < this.gameObjects.length; h++) {
                // Objects cannot collide with themselves.
                if(i !== h) {
                    var g1 = this.gameObjects[i];
                    var g2 = this.gameObjects[h];

					var innerType = this.gameObjects[h].constructor.name;

                    // Shots pass through their owners.
                    if (type === 'Player' && innerType === 'Shot' && g2.getOwner() === g1
                        || type === 'Shot' && innerType === 'Player' && g1.getOwner() === g2) {
                        continue; 
                    }

                    // Process the collision if it occurs.
                    this.checkCollision(this.gameObjects[i], this.gameObjects[h]);
                }
            }
        }
    };

    /**
     * Determines whether or not two objects will collide.
     * 
     * @param obj1 a GameObject to check collision for
     * @param obj2 a GameObject to check collision for
     * @return true if the objects will collide, false otherwise.
     */
    Game.prototype.checkCollision = function(obj1, obj2) {
		var type1 = obj1.constructor.name;
		var type2 = obj2.constructor.name;

        var v1 = obj1.getVel();
        var v2 = obj2.getVel();
        var l1 = obj1.getLoc();
        var l2 = obj2.getLoc();
        var s1 = obj1.getSize();
        var s2 = obj2.getSize();

        if(l1.x + s1.width > l2.x && l1.x < l2.x + s2.width) {
            if(l1.y + s1.height + v1.y > l2.y && l1.y < l2.y + s2.height/2) {
	            console.log('Collision occured!');

                if (type1 === 'Shot') {
                    if(type2 === 'Shot') {
                        var tmp = v1.y;
                        v1.y = v2.y;
                        v2.y = tmp;
                    } else {
                        v1.y = -v1.y;
                    }
                } else {
                    v1.y = 0; 
                }
            } else if(l1.y + v1.y < l2.y + s2.height && l1.y + s1.height > l2.y + s2.height/2) {
	            console.log('Collision occured!');

                if (type1 === 'Shot') {
                    if(type2 === 'Shot') {
                        var tmp = v1.y;
                        v1.y = v2.y;
                        v2.y = tmp;
                    } else {
                        v1.y = -v1.y;
                    }
                } else {
                    v1.y = 0; 
                }
            }
        } else if(l1.y + s1.height > l2.y && l1.y < l2.y + s2.height) {
            if(l1.x + s1.width + v1.x > l2.x && l1.x + s1.width < l2.x + s2.width/2) {
	            console.log('Collision occured!');

                if (type1 === 'Shot') {
                    if(type2 === 'Shot') {
                        var tmp = v1.x;
                        v1.x = v2.x;
                        v2.x = tmp;
                    } else {
                        v1.x = -v1.x;
                    }
                } else {
                    v1.x = 0; 
                }
            } else if(l1.x + v1.x < l2.x + s2.width && l1.x > l2.x + s2.width/2) {
	            console.log('Collision occured!');

                if (type1 === 'Shot') {
                    if(type2 === 'Shot') {
                        var tmp = v1.x;
                        v1.x = v2.x;
                        v2.x = tmp;
                    } else {
                        v1.x = -v1.x;
                    }
                } else {
                    v1.x = 0;
                }
            }
        }
    };

    /**
     * Add a new game object.
     * 
     * @param newObject the new GameObject to add.
     */
    Game.prototype.addObject = function(newObject) {
        this.gameObjects.push(newObject);
    };

    /**
     * Get all game objects.
     * 
     * @return all game objects.
     */
    Game.prototype.getGameObjects = function() {
        return this.gameObjects;
    };

    exports.Game = Game;
})(typeof global === 'undefined' ? window : exports);