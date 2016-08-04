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
        this.updateObjects();
        //this.checkAllCollisions();
    };

    /**
     * Runs the update method for all game objects.
     */
    Game.prototype.updateObjects = function () {
        for(var i = this.gameObjects.length-1; i >= 0; i--) {
            var g = this.gameObjects[i];

            if(g.checkDestroy()) { 
				this.gameObjects.splice(i,1);
				continue;
			}

			if(typeof(g.update) !== 'undefined') {
				g.update();

                // Check collision for object now that it has moved.
                for (var h = this.gameObjects.length - 1; h >= 0; h--) {
                    if (i === h) { continue; }

                    var g1 = this.gameObjects[i];
                    var g2 = this.gameObjects[h];

                    var type = this.gameObjects[i].constructor.name;
                    var innerType = this.gameObjects[h].constructor.name;

                    // Don't check blocks colliding with each other.
                    if (type === 'Block' && innerType === 'Block') { continue; }

                    // Ignore shots colliding with their owner.
                    if ((type === 'Shot' && innerType === 'Player' && g1.getOwner() === g2)
                        || (innerType === 'Shot' && type === 'Player' && g2.getOwner() === g1)) {
                        continue;
                    }
                    
                    // Process the collision if it exists.
                    if (this.intersects(g1, g2)) {
                        if (type === 'Shot' && innerType === 'Player') {
                            g1.setDestroy(true);
                            g2.takeShotDamage(g1);
                        } else if (type === 'Player' && innerType === 'Shot') {
                            g2.setDestroy(true);
                        } else {
                            this.adjustObject(g1, g2);
                        }
                    }
                }
			}
		}
    }

    /**
     * Adjusts an object if it is currently intersecting another object.
     */
    Game.prototype.adjustObject = function (obj1, obj2) {
        var type = obj1.constructor.name;
        var otherType = obj2.constructor.name;

        var loc1 = obj1.getLoc();
        var loc2 = obj2.getLoc();
        var vel1 = obj1.getVel();
        var vel2 = obj2.getVel();
        var size1 = obj1.getSize();
        var size2 = obj2.getSize();
        var movingX = false;

        var deltaX = Math.min(loc1.x + size1.width - loc2.x, loc2.x + size2.width - loc1.x);
        var deltaY = Math.min(loc1.y + size1.height - loc2.y, loc2.y + size2.height - loc1.y);

        if (deltaX <= deltaY) {
            if (loc1.x < loc2.x) { loc1.x = loc2.x - size1.width; }
            else { loc1.x = loc2.x + size2.width; }
            movingX = true;
        } else {
            if (loc1.y < loc2.y) { loc1.y = loc2.y - size1.height; }
            else { loc1.y = loc2.y + size2.height; }
        }

        if (type === 'Shot') {
            if (otherType === 'Shot') {
                if(movingX) {
                    var tmp = vel1.x;
                    vel1.x = vel2.x;
                    vel2.x = tmp;
                } else {
                    var tmp = vel1.y;
                    vel1.y = vel2.y;
                    vel2.y = tmp;
                }
            } else if (otherType === 'Block') {
                if (obj1.getDistance() <= 0) { obj1.setDestroy(true); }
                if(movingX) {
                    vel1.x *= -1;
                } else {
                    vel1.y *= -1;
                }
            }
        }
    };

    /**
     * Returns true if the two objects intersect each other.
     */
    Game.prototype.intersects = function (obj1, obj2) {
        var loc1 = obj1.getLoc();
        var loc2 = obj2.getLoc();
        var size1 = obj1.getSize();
        var size2 = obj2.getSize();

        var o1 = {
            left: loc1.x,
            right: loc1.x + size1.width,
            top: loc1.y,
            bottom: loc1.y + size1.height
        };
        
        var o2 = {
            left: loc2.x,
            right: loc2.x + size2.width,
            top: loc2.y,
            bottom: loc2.y + size2.height
        };
        
        return !(o2.left > o1.right || 
           o2.right < o1.left || 
           o2.top > o1.bottom ||
           o2.bottom < o1.top);
    };

    /**
     * Updates all objects that are colliding.
     */
    Game.prototype.checkAllCollisions = function() {
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
            if(l1.y + s1.height + v1.y > l2.y && l1.y < l2.y + s2.height/2 && v1.y > 0) {
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
                    l1.y = l2.y - s1.height;
                }
            } else if(l1.y + v1.y < l2.y + s2.height && l1.y + s1.height > l2.y + s2.height/2 && v1.y < 0) {
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
                    l1.y = l2.y + s2.height;
                }
            }
        } else if(l1.y + s1.height > l2.y && l1.y < l2.y + s2.height) {
            if(l1.x + s1.width + v1.x > l2.x && l1.x + s1.width < l2.x + s2.width/2 && v1.x > 0) {
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
                    l1.x = l2.x - s1.width;
                }
            } else if(l1.x + v1.x < l2.x + s2.width && l1.x > l2.x + s2.width/2 && v1.x < 0) {
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
                    l1.x = l2.x + s2.width;
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