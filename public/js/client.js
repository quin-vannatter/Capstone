document.addEventListener('DOMContentLoaded', function (event) {
    var socket;
    var game;

    // Focus name input.
    document.getElementById('playerName').focus();

    // On-click event for connect.
    document.getElementById('connect').onclick = function (event) {
        var playerName = document.getElementById('playerName').value;

        console.log('Connecting to server...');

        socket = io('localhost:3700');

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

        socket.on('player joined', function (data) {
            console.log(data);
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


});