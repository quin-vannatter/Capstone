 (function() {
	document.onreadystatechange = function() { 
		if (document.readyState == 'interactive') {
			initClient();
			initCanvas();
		}
	};
}());