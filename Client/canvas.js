 (function() {
	var playerSize = 60;
	var playerColor = '#00ff00';
	var playerPosition = {
		x: 100,
		y: 100
	}
	var playerSpeed = 1;
	
	var moveControls = {
		up: false,
		down: false,
		left: false,
		right: false
	};
	
	var tickRate = 10;
	
	var canvas;
	var context;
	
	function mouseDown(event) {
		var x = event.pageX;
		var y = event.pageY;
		
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		
		console.log('Clicked (' + x + ', ' + y + ')');
	}
	
	function keyUp(event) {
		switch (event.keyCode) {
			// w
			case 87:
				moveControls.up = false;
				
				break;
			// a
			case 65:
				moveControls.left = false;
				
				break;
			// d
			case 68:
				moveControls.right = false;
				
				break;
			// s
			case 83:
				moveControls.down = false;
				
				break;
		}
		
		drawPlayer();
	}
	
	function keyDown(event) {
		switch (event.keyCode) {
			// w
			case 87:
				moveControls.up = true;
				
				break;
			// a
			case 65:
				moveControls.left = true;
				
				break;
			// d
			case 68:
				moveControls.right = true;
				
				break;
			// s
			case 83:
				moveControls.down = true;
				
				break;
		}
		
		drawPlayer();
	}
	
	function drawPlayer() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		
		context.fillStyle = playerColor;
		context.fillRect(playerPosition.x, playerPosition.y, playerSize, playerSize);
	}
	
	function resizeCanvas() {
		canvas.width = window.innerWidth - 30;
		canvas.height = window.innerHeight - 50;
	}
	
	function checkMovement() {
		var velocity = {
			x: 0,
			y: 0
		};
		
		if (moveControls.up) {
			velocity.y = -1;
		} else if (moveControls.down) {
			velocity.y = 1;
		}
		
		if (moveControls.left) {
			velocity.x = -1;
		} else if (moveControls.right) {
			velocity.x = 1;
		}
		
		velocity = normalize(velocity);
		
		playerPosition.x += velocity.x;
		playerPosition.y += velocity.y;
		
		drawPlayer();
	}
	
	function normalize(vector) {
		var distance = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
		
		if (distance === 0) {
			vector.x = 0;
			vector.y = 0;
		} else {
			vector.x /= distance;
			vector.y /= distance;
		}
		
		return vector;
	}
	
	initCanvas = function() { 
		canvas = document.getElementById('gameCanvas');
		context = canvas.getContext('2d');
		context.fillStyle = playerColor;
		
		canvas.width = window.innerWidth - 30;
		canvas.height = window.innerHeight - 50;
		
		window.addEventListener('resize', resizeCanvas, false);
		
		canvas.addEventListener('mousedown', mouseDown, false);
		document.addEventListener('keydown', keyDown, false);
		document.addEventListener('keyup', keyUp, false);
		
		window.setInterval(function () {
			checkMovement();
		}, tickRate);
	};
}());
 
 
