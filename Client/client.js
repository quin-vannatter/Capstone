 (function() {
	var isConnected = false;
	var ws;
	
	ws.onopen = function () {
		console.log('Opening...')
		ws.send('Test send.');
	};
	
	ws.onmessage = function (evt) { 
	  var received_msg = evt.data;
	  console.log("Message is received...");
	  console.log(received_msg);
	};

	ws.onclose = function()	{ 
	  console.log("Connection is closed..."); 
	};
   
	function connect() {
		if (isConnected) {
			console.log('Already connected.');
		} else {
			ws = new WebSocket("ws://142.156.124.159");
		}
	}

	function move() {
		console.log('moving');
	}

	function shoot() {
		console.log('shooting');
	}

	document.onreadystatechange = function() { 
		if (document.readyState == "interactive") {
			document.getElementById("connect").addEventListener('click', connect);
			document.getElementById("move").addEventListener('click', move);
			document.getElementById("shoot").addEventListener('click', shoot);
		}
	};
}());
 
 
