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
    console.log('Trying to load index.html');

    res.sendFile(__dirname + '/index.html');
});

// Setup static directory (js/css/etc).
app.use(express.static(__dirname + '/public'));

// Set server to listen on specified port.
http.listen(port, function () {
    console.log('Listening on port ' + port);
});


var clients = {};
var Game = require('./classes/game.js');
var Player = require('./classes/player.js');

var game = new Game();

/*
setInterval(function () {
    game.tick();
}, 500);
*/

io.on('error', function (error) {
    console.error(error.stack);
});

// Setup socket on-connect.
io.on('connection', function (client) {
    console.log('Client connecting.');

    // Generate user id.
    client.userId = uuid();
    clients[client.userId] = client;

    console.log('\t User connected: ' + client.userId);
    //console.log(clients);

    // Disconnect.
    client.on('disconnect', function (client) {
        console.log('\t User disconnected.');
        console.log(client);

        //clients[client.userId] = null;
    });

    // Set name.
	client.on('set name', function (nameMessage) {
        console.log('\t Set name request:');
        console.log(nameMessage);

		clients[nameMessage.userId] = nameMessage.name;

        client.broadcast('player joined', clients[nameMessage.userId]);
	});
});