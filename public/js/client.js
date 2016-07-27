(function () {
    'use strict';

    var canvas;
    var context;

    var socket;
    var userId;
    var players;
    
	var playerSpeed = 1;
	
    function keyUp(event) {
		switch (event.keyCode) {
			case 87: moveControls.up = false; break; // w
			case 65: moveControls.left = false; break; // a
			case 68: moveControls.right = false; break; // d
			case 83: moveControls.down = false; break; // s
		}
    }

	function keyDown(event) {
        var currentMovement = moveControls;

		switch (event.keyCode) {
			case 87: moveControls.up = true; break; // w
			case 65: moveControls.left = true; break; // a
			case 68: moveControls.right = true; break; // d
			case 83: moveControls.down = true; break; // s
		}

        console.log('Changed');
    }
		
    document.addEventListener('DOMContentLoaded', function (event) {
        canvas = document.getElementById('gameCanvas');
        context = canvas.getContext('2d');
        context.fillStyle = '#f00';
            
        // Update canvas.
        setInterval(function () {
            context.clearRect(0, 0, canvas.width, canvas.height);

            for (var p in players) {
                if (!players.hasOwnProperty(p)) continue;

                context.fillRect(players[p].x, players[p].y, 10, 10);
            }
        }, 160);


        // Focus name input.
        document.getElementById('playerName').focus();

        // On-click event for connect.
        document.getElementById('connect').onclick = function (event) {
            var playerName = document.getElementById('playerName').value;

            console.log('Connecting to server...');

            socket = io();

            // On connect.
            socket.on('connect', function (data) {
                console.log('Connected to server.');

                socket.emit('set name', playerName);
            });

            // On disconnect.
            socket.on('disconnect', function (data) {
                console.log('Disconnected from server.');
                socket.disconnect();
            });

            socket.on('get userId', function (data) {
                userId = data;
                console.log('User id: ' + userId);
            });

            socket.on('player joined', function (avatars) {
                console.log('Player joined.');
                players = avatars;
            });

            socket.on('player quit', function (name) {
                console.log(name + ' has left the game.');
            });
        };

        // On-click event for disconnect.
        document.getElementById('disconnect').onclick = function (event) {
            if (typeof socket !== 'undefined') {
                console.log('Disconnecting from server...');
                socket.disconnect();
            } else {
                console.log('Not connected.');
            }
        };

		document.addEventListener('keydown', keyDown, false);
		document.addEventListener('keyup', keyUp, false);
    });
}());