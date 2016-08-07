(function(exports) {
    /**
     * The game instance that's shared across all clients and the server.
     */
    var Game = function() {
        this.gameObjects = [];
        this.SYNC_DISTANCE = 500;
        this.TRUST_DISTANCE = 20;
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
    };

    /**
     * Runs the update method for all game objects.
     */
    Game.prototype.updateObjects = function () {
        for(var i = this.gameObjects.length-1; i >= 0; i--) {
            var g1 = this.gameObjects[i];

            if(g1.getDestroy()) { 
				this.gameObjects.splice(i,1);
				continue;
			}

            if(typeof(g1.update) !== 'undefined') {
                g1.update();
                
                // Check collision for object now that it has moved.
                for (var h = this.gameObjects.length - 1; h >= 0; h--) {
                    if (i === h) { continue; }

                    var g2 = this.gameObjects[h];

                    var type = g1.constructor.name;
                    var innerType = g2.constructor.name;

                    // Don't check blocks colliding with each other.
                    if (type === 'Player' && g1.getKill()) { continue; }
                    if (type === 'Block' && innerType === 'Block') { continue; }

                    // Ignore shots colliding with their owner.
                    if ((type === 'Shot' && innerType === 'Player' && g1.getOwnerId() === g2.getId())
                        || (innerType === 'Shot' && type === 'Player' && g2.getOwnerId() === g1.getId())) {
                        continue;
                    }
                    
                    // Process the collision if it exists.
                    if (this.intersects(g1, g2)) {
                        if (type === 'Shot' && innerType === 'Player') {
                            var location = this.getRandomSpawnLocation();
                            g1.setDestroy(true);
                            g2.takeShotDamage(g1, location);
                            g1.setHitPlayer(true);
                        } else if (type === 'Player' && innerType === 'Shot') {
                            var location = this.getRandomSpawnLocation();
                            g2.setDestroy(true);
                            g1.takeShotDamage(g2, location);
                            g2.setHitPlayer(true);
                        } else {
                            this.adjustObject(g1, g2);
                        }
                    }
                }
            }
        }
    }
    
    function getSpawnLocations() {
        var locs = [];

        locs.push({x: 117, y: 105});
        locs.push({x: 662, y: 125});
        locs.push({x: 977, y: 195});
        locs.push({x: 472, y: 285});
        locs.push({x: 819, y: 951});
        locs.push({x: 514, y: 968});
        locs.push({x: 129, y: 960});
        locs.push({x: 248, y: 350});

        return locs;
    }

    Game.prototype.getRandomSpawnLocation = function() {
        var spawnLocations = getSpawnLocations();
        var num = Math.floor(Math.random() * spawnLocations.length);

        return spawnLocations[num];
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
        var mapBounds = this.getMapBounds(obj1);

        var deltaX = Math.min(loc1.x + size1.width - loc2.x, loc2.x + size2.width - loc1.x);
        var deltaY = Math.min(loc1.y + size1.height - loc2.y, loc2.y + size2.height - loc1.y);

        if (deltaX <= deltaY) {
            if (loc1.x <= loc2.x) { loc1.x = loc2.x - size1.width; }
            else { loc1.x = loc2.x + size2.width; }
            loc1.x = Math.max(Math.min(mapBounds.max.x,loc1.x),mapBounds.min.x);
            movingX = true;
        } else {
            if (loc1.y < loc2.y) { loc1.y = loc2.y - size1.height; }
            else { loc1.y = loc2.y + size2.height; }
            loc1.y = Math.max(Math.min(mapBounds.max.y,loc1.y),mapBounds.min.y);
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
     * Gets the player with the matching id.
     */
    Game.prototype.getPlayerById = function (playerId) {
        for(var i = 0; i < this.gameObjects.length; i++) {
            var obj = this.gameObjects[i];

            if (obj.constructor.name === 'Player' && obj.getId() === playerId) {
                return obj;
            }
        }

        return null;
    };

    /**
     * Returns the distance between two points.
     */
    Game.prototype.getDistance = function (p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + (Math.pow(p1.y - p2.y, 2)));
    };

    /**
     * Updates the player's velocity, and, if the distance between the player's current
     * location and the specified location is greater than the sync distance, update
     * the player's location.
     */
    Game.prototype.updateVelAndLocRange = function (playerId, loc, vel) {
        var player = this.getPlayerById(playerId);

        player.setVel(vel);
        player.setUpdateLoc(loc);
    };

    /**
     * Updates a player's location and velocity.
     */
    Game.prototype.updatePlayerLocAndVel = function(playerId, loc, vel) {
        var player = this.getPlayerById(playerId);

        player.setLoc(loc);
        player.setVel(vel);
    };

    /**
     * Updates a player's velocity.
     */
    Game.prototype.updatePlayerVelocity = function(playerId, velocity) {
        var mover = this.getPlayerById(playerId);

        mover.setVel(velocity);
    };

    /**
     * Attempts to create a shot for the player.
     */
    Game.prototype.attemptShot = function (playerId, shotInfo) {
        var shooter = this.getPlayerById(playerId);

        if (shooter.getPower() >= shooter.getPowerPerShot()) {
            shooter.subrtactShotPower();
            var shot = new Shot(shooter.getId(), shooter.getLoc(), shooter.getSize(), shotInfo);
            this.addObject(shot);

            return shot;
        }

        return null;
    }

    /**
     * Removes the specified player from the game.
     */
    Game.prototype.removePlayer = function (playerId) {
        for(var i = this.gameObjects.length-1; i >= 0; i--) {
            if (this.gameObjects[i].constructor.name === 'Player'
                && this.gameObjects[i].getId() === playerId) {

                this.gameObjects.splice(i,1);

                return;
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

    /**
     * Gets all player objects in the game.
     */
    Game.prototype.getPlayersForTransit = function() {
        var players = [];

        for(var i = 0; i < this.gameObjects.length; i++) {
            if (this.gameObjects[i].constructor.name === 'Player') {
                players.push(this.gameObjects[i].toTransit());
            }
        }

        return players;
    };

    Game.prototype.getMapBounds = function(obj) {
        var first = true;
        var mapBounds = {};
        this.gameObjects.forEach(function(g) {
            if(g.constructor.name == "Block") {
                var loc = g.getLoc();
                var size = g.getSize();
                var pSize = obj.getSize();
                if(first) {
                    mapBounds = {
                        min: {
                            x: loc.x + size.width,
                            y: loc.y + size.height
                        },
                        max: {
                            x: loc.x,
                            y: loc.y
                        }
                    }
                    first = false;
                } else {
                    mapBounds = {
                        min: {
                            x: Math.min(mapBounds.min.x, loc.x + pSize.width/2),
                            y: Math.min(mapBounds.min.y, loc.y + pSize.height/2)
                        },
                        max: {
                            x: Math.max(mapBounds.max.x, loc.x - pSize.width/2),
                            y: Math.max(mapBounds.max.y, loc.y - pSize.height/2)
                        }
                    }
                }
            }
        });
        return mapBounds;
    }

    exports.Game = Game;
})(typeof global === 'undefined' ? window : exports);