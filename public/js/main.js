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
		shoot: 1,
		teleport: 3
	};
	
	var input = {
		up: false,
		down: false,
		left: false,
		right: false,
		shoot: false,
		teleport: false
	}
	
	// Where the game is drawn.
	var canvas;
	var context;
	
	// Holds objects that get drawn.
	var gameObjects;
	
	// The player.
	var player;
	
	document.addEventListener("DOMContentLoaded", function(event) {
		
		document.addEventListener('keydown',handleInputEvent);
		document.addEventListener('keyup',handleInputEvent);
		document.addEventListener('mousemove',handleInputEvent);
		document.addEventListener('mouseup',handleInputEvent);
		document.addEventListener('mousedown',handleInputEvent);
		
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
		gameObjects = [];
		player = new Player(0,0);
		gameObjects.push(player);
	}
	
	/**
	  * Update all the game objects present in the game objects list.
	  */
	function update() {
		updatePlayerMovement();
		gameObjects.forEach(function(element) {
			element.update();
		});
	}
	
	function updatePlayerMovement() {
		var v = {
			x: 0,
			y: 0
		}
		if(input.up) { v.y = -1;	}
		if(input.down) { v.y = 1; }
		if(input.left) { v.x = -1; }
		if(input.right) { v.x = 1; }
		
		var mag = Math.sqrt(Math.pow(v.x,2) + Math.pow(v.y,2));
		if(mag == 0) {
			v = {
				x: 0,
				y: 0
			};
		} else {
			v.x /= mag;
			v.y /= mag;
		}
		
		player.setVel(v);
	}

	/**
	  * Handles the key events.
	  */
	function handleInputEvent(e) {
		for(var key in input) {
			if(input.hasOwnProperty(key)) { 
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
		
		// Loop through the game objects and draw each one.
		for(var i = 0;i < gameObjects.length;i++) {
			var g = gameObjects[i];
			context.drawImage(g.getTex(),g.getLoc().x,g.getLoc().y,
				g.getSize().width,g.getSize().height);
		}
	}
}());