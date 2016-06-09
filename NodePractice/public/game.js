document.addEventListener("DOMContentLoaded", function (event) {
	var socket;
	
    document.getElementById('messageInput').focus();

	document.getElementById('connect').onclick = function () {
		socket = io('http://10.113.18.32:3700');
		
		socket.on('connect', function (data) {
			console.log('Connected to server.');
			
			socket.emit('set name', document.getElementById('name').value);
			
			console.log(data);
		});

		socket.on('chat message', function (message) {
			var messageList = document.getElementById('messages');

			messageList.innerHTML += '<li>' + message.user + ': ' + message.message + '</li>';
		});

		console.log('Connecting...');
		
        return false;
    };
	
	
    document.getElementById('sendMessage').onclick = function () {
        socket.emit('chat message', document.getElementById('messageInput').value);

        document.getElementById('messageInput').value = '';
        document.getElementById('messageInput').focus();

        return false;
    };
});