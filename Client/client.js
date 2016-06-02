 (function() {
	var serverAddress = 'ws://142.156.124.159:70';
	var isConnected = false;
	var ws;
	
	var shotCount = 0;
	
	function connect() {
		if (isConnected) {
			console.log('Already connected.');
		} else {
			console.log('Connecting...');
			
			ws = new WebSocket(serverAddress);
			isConnected = true;
					
			ws.onopen = function () {
				console.log('Connection established.');
			};
			
			ws.onmessage = function (evt) {
				var received_msg = evt.data;

				console.log('Message received:');
				console.log(received_msg);
			};
			
			ws.error = function (evt) {
				var received_msg = evt.data;

				console.log('Error received:');
				console.log(received_msg);
			};

			ws.onclose = function()	{ 
				console.log('Connection is closed.');
				isConnected = false;
			};
		}
	}

	function move() {
		sendMessage('move');
	}

	function shoot() {
		shotCount++;
		sendMessage('shoot: ' + shotCount);
	}
	
	function disconnect() {
		if (!isConnected) {
			console.log('Not connected.');
		} else {
			console.log('Closing connection...');
			
			ws.close();
		}
	}

	function sendMessage(message) {
		if (!isConnected) {
			console.log('Not connected.');
		} else {
			console.log('Sending message: ' + message);
			ws.send(message);
		}
	}
	
	initClient = function() { 
		if (!window.WebSocket) {
			console.log('Browser does not support WebSockets.');
		} else {		
			document.getElementById('connect').addEventListener('click', connect);
			document.getElementById('move').addEventListener('click', move);
			document.getElementById('shoot').addEventListener('click', shoot);
			document.getElementById('disconnect').addEventListener('click', disconnect);
		}
	};
}());
 
 
