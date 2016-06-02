 (function() {
	var canvas;
	var canvasContext;
	
	function createPlayer() {
		canvasContext.fillStyle = '#AAAAAA';
		canvasContext.fillRect(0, 0, 100, 100);
	}
	
	function mouseDown() {
		var x = event.pageX;
		var y = event.pageY;
		
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		
		console.log('Clicked (' + x + ', ' + y + ')');
	}
	
	function mouseMove() {
		var x = event.pageX;
		var y = event.pageY;
		
		x -= canvas.offsetLeft;
		y -= canvas.offsetTop;
		
		console.log('Moved (' + x + ', ' + y + ')');
	}
	
	document.onreadystatechange = function() { 
		if (document.readyState == 'interactive') {
			canvas = document.getElementById('gameCanvas');
			
			canvasContext = canvas.getContext('2d');
			createPlayer();
			
			canvas.addEventListener('mousedown', mouseDown, false);
			canvas.addEventListener('mousemove', mouseMove, false);
		}
	};
}());
 
 
