/* main.js
 * Where the game is ran from.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */
	
// When the game starts.
(function() {
	'use-strict';
	
	// Game interval.
	const GAME_INTERVAL = 1000/60;
	
	// Canvas properties.
	const CANVAS_LOC = 'canvas';
	const CANVAS_STYLE = '#555555';
	const CANVAS_SIZE = {
		width: 900,
		height: 500
	};
	
	// Inputs.
	var inputMapping = {
		up: 'KeyW',
		down: 'KeyS',
		left: 'KeyA',
		right: 'KeyD',
		shoot: 1,
		teleport: 2,
		focus: 3
	};
	
	var input = {};
	var inputOld = {};
	
	// Where the game is drawn.
	var canvas;
	var context;
	var cursor = {
		x: 0,
		y: 0
	};
	
	// Holds objects that get drawn.
	var gameObjects;
	
	// The player.
	var player;
	
	// The camera.
	var camera;
	
	document.addEventListener("DOMContentLoaded", function(event) {
		document.addEventListener('keydown',handleInputEvent);
		document.addEventListener('keyup',handleInputEvent);
		document.addEventListener('mouseup',handleInputEvent);
		document.addEventListener('mousedown',handleInputEvent);
		window.addEventListener('resize',resizeCanvas);
		
		// Add states to input object using mapping object.
		for(var key in inputMapping){
			if(inputMapping.hasOwnProperty(key)) {
				input[key] = false;
				inputOld[key] = false;
			}
		}
		
		// Holds all the game objects.
		gameObjects = [];
		
		// Get the canvas.
		getCanvas();
		
		// Initialize the game objects.
		initalization();
		
		// Start the game
		gameFrame();
	});
	
	/**
	  * Gets the canvas of the game.
	  */
	function getCanvas() {
		// Get the canvas and context.
		canvas = document.getElementById(CANVAS_LOC);
		context = canvas.getContext('2d');
		
		// Set the size of the canvas.
		resizeCanvas();
	}
	
	/**
	  * Updates and draws the game.
	  */
	function gameFrame() {
		update();
		draw();
		
		setTimeout(gameFrame, GAME_INTERVAL);
	}

	/**
	  * Where the creation of the game objects is done.
	  */
	function initalization() {
		player = new Player({x: 225, y: 225}, 'player.png');
		
		camera = new Camera(player,canvas);
		
		gameObjects.push(new Block({x:50,y:50,}, {width:1000, height:50}));
		gameObjects.push(new Block({x:1050,y:50}, {width:50, height:1000}));
		gameObjects.push(new Block({x:50,y:50}, {width:50,height:1000}));
		gameObjects.push(new Block({x:50,y:1050}, {width:1050, height:50}));
		
		gameObjects.push(player);
		gameObjects.push(camera);
	}
	
	/**
	  * Update all the game objects present in the game objects list.
	  */
	function update() {
		// Update the player movement.
		updatePlayerMovement();
		
		// Check the physics.
		checkPhysics();
		
		// Check for objects that need to be destroyed.
		for(var i = gameObjects.length-1; i >= 0; i--) {
			var g = gameObjects[i];
			if(g.checkDestroy()) { 
				gameObjects.splice(i,1);
				continue;
			}
			if(typeof(g.update) !== 'undefined') {
				g.update();
			}
		}
		
		// Update the input old.
		for(var key in input) {
			if(input.hasOwnProperty(key)) {
				inputOld[key] = input[key];
			}
		}
	}
	
	function updatePlayerMovement() {
		var velocity = {
			x: 0,
			y: 0
		}
		
		if(input.up) { velocity.y = -1; }
		else if(input.down) { velocity.y = 1; }
		
		if(input.left) { velocity.x = -1; }
		else if(input.right) { velocity.x = 1; }
		
		if(input.shoot && !inputOld.shoot && player.getPower() > player.getPowerPerShot()) {
			player.subrtactShotPower();
			gameObjects.push(new Shot(player,cursor));
		}
		
		velocity = Vector.multiply(Vector.normalize(velocity),player.speed);
		player.setVel(velocity);
	}
	
	function checkPhysics() {
		for(var i = 0;i < gameObjects.length; i++) {
			var type = gameObjects[i].constructor.name;
			
			if (type !== 'Player' && type !== 'Shot') { continue; }
			
			var g1 = gameObjects[i];
			
			if(g1.getClipping()) {
				for(var h = 0; h < gameObjects.length; h++) {
					var g2 = gameObjects[h];
					
					var innerType = gameObjects[h].constructor.name;
					
					if (type === 'Player' && innerType === 'Shot' && g2.getOwner() === g1
						|| type === 'Shot' && innerType === 'Player' && g1.getOwner() === g2) {
						continue; 
					}
					
					if(g2.getClipping() && g1 != g2) {
						var v1 = g1.getVel();
						var v2 = g2.getVel();
						var l1 = g1.getLoc();
						var l2 = g2.getLoc();
						var s1 = g1.getSize();
						var s2 = g2.getSize();
						
						if(l1.x + s1.width > l2.x && l1.x < l2.x + s2.width) {
							if(l1.y + s1.height + v1.y > l2.y + v2.y && l1.y < l2.y) {
								
								if (type === 'Shot') { 
									v1.y = -v1.y;
								} else { 
									l1.y = l2.y - s1.height;
									v1.y = 0; 
								}
							} else if(l1.y + v1.y < l2.y + s2.height && l1.y > l2.y) {
								if (type === 'Shot') { 
									v1.y = -v1.y;
								} else { 
									l1.y = l2.y + s2.height;
									v1.y = 0; 
								}
							}
						}else if(l1.y + s1.height > l2.y && l1.y < l2.y + s2.height) {
							if(l1.x + s1.width + v1.x > l2.x && l1.x < l2.x) {
								if (type === 'Shot') { 
									v1.x = -v1.x;
								} else { 
									l1.x = l2.x - s1.width;
									v1.x = 0; 
								}
							} else if(l1.x + v1.x < l2.x + s2.width && l1.x > l2.x) {
								if (type === 'Shot') { 
									v1.x = -v1.x;
								} else {
									l1.x = l2.x + s2.width;
									v1.x = 0;
								}
							}
						}
					}
				}
			}
		}
	}
	
	/**
	  * Handles the key events.
	  */
	function handleInputEvent(e) {
		for(var key in inputMapping) {
			if(inputMapping.hasOwnProperty(key)) { 
				switch(e.type) {
					case 'keydown':
					case 'keyup':
						if(e.code === inputMapping[key]) {
							input[key] = e.type === 'keydown';
						}
						break;
					case 'mousedown':
					case 'mouseup':
						if(e.which === inputMapping[key]) {
							input[key] = e.type === 'mousedown';
						}
						var r = canvas.getBoundingClientRect();
						var c = camera.getLoc();
						cursor = {
							x: e.clientX - r.left + c.x,
							y: e.clientY - r.top + c.y
						};
						break;
				}
			}
		}
	}
	
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		if(typeof(camera) !== 'undefined') { camera.reCenter(); }
	}
	
	/**
	  * Draws all the game objects present in the game objects list on the canvas.
	  */
	function draw() {
		
		// Draw the background for the canvas.
		context.clearRect(0,0,canvas.width,canvas.height)
		
		// Loop through the game objects.
		gameObjects.forEach(function(g) {
			
			// If the game object has something to draw.
			if(g.getTex() != null) {
				
				// Calculate the position relative to the camera.
				var loc = camera.calculateOffset(g);
				
				// Draw the game object.
				//context.translate(loc.x,loc.y);
				//context.rotate(g.getRotatation());
				context.drawImage(g.getTex(),loc.x,loc.y,
					g.getSize().width,g.getSize().height);
				//context.translate(0,0);
				//context.rotate(0);
			}
		});
	}
}());