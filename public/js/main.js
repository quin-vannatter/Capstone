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
	const GAME_INTERVAL = 16;
	
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
		up2: 'ArrowUp',
		down2: 'ArrowDown',
		left2: 'ArrowLeft',
		right2: 'ArrowRight',
		shoot: 1,
		teleport: 3
	};
	
	var input = {};
	
	// Where the game is drawn.
	var canvas;
	var context;
	
	// Holds objects that get drawn.
	var gameObjects;
	
	// The player.
	var player;
	
	// The camera.
	var camera;
	
	document.addEventListener("DOMContentLoaded", function(event) {
		
		document.addEventListener('keydown',handleInputEvent);
		document.addEventListener('keyup',handleInputEvent);
		document.addEventListener('mousemove',handleInputEvent);
		document.addEventListener('mouseup',handleInputEvent);
		document.addEventListener('mousedown',handleInputEvent);
		
		// Add states to input object using mapping object.
		for(var key in inputMapping){
			if(inputMapping.hasOwnProperty(key)) {
				input[key] = false;
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
		player = new Player(0,0);
		camera = new Camera(player,canvas);
		gameObjects.push(player);
		gameObjects.push(camera);
		gameObjects.push(new Block(34,56));
		gameObjects.push(new Block(300,100));
		gameObjects.push(new Block(100,200));
		gameObjects.push(new Block(-224,50));
	}
	
	/**
	  * Update all the game objects present in the game objects list.
	  */
	function update() {
		
		// Update the player movement.
		updatePlayerMovement();
		
		// Loop through and update each game object.
		gameObjects.forEach(function(g) {
			if(typeof(g.update) !== 'undefined') {
				g.update();
			}
		});
	}
	
	function updatePlayerMovement() {
		var v = {
			x: 0,
			y: 0
		}
		
		if(input.up) { v.y = -1; }
		if(input.down) { v.y = 1; }
		if(!input.up && !input.down) { v.y = 0; }
		
		if(input.left) { v.x = -1; }
		if(input.right) { v.x = 1; }
		if(!input.left && !input.right) { v.x = 0; }
		
		var direction = Math.atan2(v.y,v.x);
		v = {
			x: player.speed * Math.cos(direction) * Math.abs(v.x),
			y: player.speed * Math.sin(direction) * Math.abs(v.y)
		}
		
		player.setVel(v);
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
						break;
				}
			}
		}
	}
	
	/**
	  * Draws all the game objects present in the game objects list on the canvas.
	  */
	function draw() {
		
		// Draw the background for the canvas.
		context.clearRect(0,0,canvas.width,canvas.height)
		context.fillStyle = CANVAS_STYLE;
		context.fillRect(0,0,canvas.width,canvas.height);
		
		// Loop through the game objects.
		gameObjects.forEach(function(g) {
			
			// If the game object has something to draw.
			if(typeof(g.getTex) !== 'undefined') {
				
				// Calculate the position relative to the camera.
				var loc = camera.calculateLoc(g);
				
				// Draw the game object.
				context.drawImage(g.getTex(),loc.x,loc.y,
					g.getSize().width,g.getSize().height);
			}
		});
	}
}());