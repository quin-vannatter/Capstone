!function(t){var e=function(){this.gameObjects=[],this.SYNC_DISTANCE=500,this.TRUST_DISTANCE=50,this.mapBounds={},this.spawnLocations=[],this.SCOREBOARD_COUNT=5};e.UPDATE_INTERVAL=1e3/60,e.prototype.update=function(){this.updateObjects()},e.prototype.updateObjects=function(){for(var t=this.gameObjects.length-1;t>=0;t--){var e=this.gameObjects[t];if(e.getDestroy())this.gameObjects[t]=null,this.gameObjects.splice(t,1);else if("undefined"!=typeof e.update){e.update();for(var o=this.gameObjects.length-1;o>=0;o--)if(t!==o){var a=this.gameObjects[o],i=e.constructor.name,n=a.constructor.name;("Block"!==i||"Block"!==n)&&("Player"===i&&e.getKill()||"Player"===n&&a.getKill()||"Shot"===i&&"Player"===n&&e.getOwnerId()===a.getId()||"Shot"===n&&"Player"===i&&a.getOwnerId()===e.getId()||this.intersects(e,a)&&e.getClipping()&&a.getClipping()&&("Shot"===i&&"Player"===n?this.applyShotHit(e,a):"Player"===i&&"Shot"===n?this.applyShotHit(a,e):this.adjustObject(e,a)))}}}},e.prototype.applyShotHit=function(t,e){t.setDestroy(!0),e.takeShotDamage(t,this.getPlayerById(t.getOwnerId())),t.setHitPlayer(!0)},e.prototype.setSpawnLocations=function(t){this.spawnLocations=[];for(var e=0;e<t.length;e++)this.spawnLocations.push({x:t[e].x,y:t[e].y})},e.prototype.getSpawnLocations=function(){return this.spawnLocations},e.prototype.getRandomSpawnLocation=function(){var t=Math.floor(Math.random()*this.spawnLocations.length);return this.spawnLocations[t]},e.prototype.adjustObject=function(t,e){var o=t.constructor.name,a=e.constructor.name,i=t.getLoc(),n=e.getLoc(),r=t.getVel(),s=e.getVel(),h=t.getSize(),c=e.getSize(),y=!1,g=Math.min(i.x+h.width-n.x,n.x+c.width-i.x),p=Math.min(i.y+h.height-n.y,n.y+c.height-i.y);if(p>=g?(i.x<=n.x?i.x=n.x-h.width:i.x=n.x+c.width,i.x=Math.max(Math.min(this.mapBounds.max.x-h.width,i.x),this.mapBounds.min.x),y=!0):(i.y<n.y?i.y=n.y-h.height:i.y=n.y+c.height,i.y=Math.max(Math.min(this.mapBounds.max.y-h.height,i.y),this.mapBounds.min.y)),"Shot"===o)if("Shot"===a)if(y){var l=r.x;r.x=s.x,s.x=l}else{var l=r.y;r.y=s.y,s.y=l}else"Block"===a&&(t.getDistance()<=0&&t.setDestroy(!0),y?r.x*=-1:r.y*=-1)},e.prototype.intersects=function(t,e){var o=t.getLoc(),a=e.getLoc(),i=t.getSize(),n=e.getSize(),r={left:o.x,right:o.x+i.width,top:o.y,bottom:o.y+i.height},s={left:a.x,right:a.x+n.width,top:a.y,bottom:a.y+n.height};return!(s.left>r.right||s.right<r.left||s.top>r.bottom||s.bottom<r.top)},e.prototype.getLeaders=function(){var t=this.getAllPlayers();return t.sort(function(t,e){return e.getScore()-t.getScore()}),t=t.slice(0,this.SCOREBOARD_COUNT)},e.prototype.getPlayerById=function(t){for(var e=0;e<this.gameObjects.length;e++){var o=this.gameObjects[e];if("Player"===o.constructor.name&&o.getId()===t)return o}return null},e.prototype.getDistance=function(t,e){return Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2))},e.prototype.updatePlayerLocAndVel=function(t,e,o){var a=this.getPlayerById(t);a.setUpdateLoc(e),a.setVel(o)},e.prototype.updatePlayerVelocity=function(t,e){var o=this.getPlayerById(t);o.setVel(e)},e.prototype.attemptShot=function(t,e){var o=this.getPlayerById(t);if(o.getPower()>=o.getPowerPerShot()){o.subrtactShotPower();var a=new Shot(o.getId(),o.getLoc(),o.getSize(),e);return this.addObject(a),a}return null},e.prototype.removePlayer=function(t){for(var e=this.gameObjects.length-1;e>=0;e--)if("Player"===this.gameObjects[e].constructor.name&&this.gameObjects[e].getId()===t)return void this.gameObjects.splice(e,1)},e.prototype.addObject=function(t){this.gameObjects.push(t)},e.prototype.getGameObjects=function(){return this.gameObjects},e.prototype.getAllPlayers=function(){for(var t=[],e=0;e<this.gameObjects.length;e++)"Player"===this.gameObjects[e].constructor.name&&t.push(this.gameObjects[e]);return t},e.prototype.getPlayersForTransit=function(){for(var t=[],e=0;e<this.gameObjects.length;e++)"Player"===this.gameObjects[e].constructor.name&&t.push(this.gameObjects[e].toTransit());return t},e.prototype.calculateMapBounds=function(){var t=!0,e={};this.gameObjects.forEach(function(o){if("Block"==o.constructor.name){var a=o.getLoc(),i=o.getSize();t?(e={min:{x:a.x+i.width,y:a.y+i.height},max:{x:a.x,y:a.y}},t=!1):e={min:{x:Math.min(e.min.x,a.x+i.width),y:Math.min(e.min.y,a.y+i.height)},max:{x:Math.max(e.max.x,a.x),y:Math.max(e.max.y,a.y)}}}}),this.mapBounds=e},t.Game=e}("undefined"==typeof global?window:exports);