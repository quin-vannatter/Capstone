'use strict';

var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var uuid = require('node-uuid');

// Set port to listen on.
var port = 3700;

// Serve index.html for GET requests.
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// Setup static directory (js/css/etc).
app.use(express.static(__dirname + '/public'));

// Set server to listen on specified port.
http.listen(port, function () {
    console.log('Listening on port ' + port);
});

var gamejs = new require('./public/js/Game.js');

var Game = gamejs.Game;
var game = new Game();


var avatars = {};

// Setup socket on-connect.
io.on('connection', function (socket) {
    console.log('\tClient connecting.');

    socket.userId = uuid();

    io.emit('player joined', avatars);

    console.log('\tUser id: ' + socket.userId);

    socket.on('error', function (err) {
        console.error(err);
    });

    /**
     * Event for when a client sets their name. Should occur immediately after
     * connecting. Creates a new avatar for the client, and notifies other
     * client of the new avatar.
     * 
     * @param name The client's name.
     */
    socket.on('set name', function () {
        console.log('\tUser[' + socket.userId + ']');

        // Send the client its userId.
        socket.emit('get userId', socket.userId);

        io.emit('player joined', avatars);
    });

    /**
     * Event for when a client disconnects. Removes player from the game.
     */
    socket.on('disconnect', function () {
        console.log('\t User disconnected: ' + socket.userId);

        socket.broadcast.emit('player quit', socket.userId);
        delete avatars[socket.userId];
    });
});