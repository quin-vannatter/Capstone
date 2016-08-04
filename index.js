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

var gameJS = new require('./public/js/Game.js');
GLOBAL.GameObject = require('./public/js/GameObject.js');

GLOBAL.Player = require('./public/js/Player.js');
GLOBAL.Block = require('./public/js/Block.js');
GLOBAL.Shot = require('./public/js/Shot.js');
GLOBAL.Vector = require('./public/js/Vector.js');

var Game = gameJS.Game;

var game = new Game();

initGame(game);

/*
while (players.length > 0) {
    // Game loop.
}
*/


var avatars = {};

// Setup socket on-connect.
io.on('connection', function (socket) {
    socket.playerId = uuid();

    // Send the joining player the game.
    var initialGameState = {
        gameObjects: stringifyGameObjects(game.getGameObjects()),
        playerId: socket.playerId
    };
    
    socket.emit('initialize game', initialGameState);
    
    // Send the new player to all other players.

    /*
        io.emit('player joined', avatars);
    */

    console.log('\tClient connected: ' + socket.playerId);

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
        socket.emit('get userId', socket.playerId);

        io.emit('player joined', avatars);
    });

    /**
     * Event for when a client disconnects. Removes player from the game.
     */
    socket.on('disconnect', function () {
        console.log('\t User disconnected: ' + socket.playerId);

        socket.broadcast.emit('player quit', socket.playerId);
        delete avatars[socket.userId];
    });
});

function initGame(game) {
    game.addObject(new Block({x:50,y:50,}, {width:1000, height:50}));
    game.addObject(new Block({x:1050,y:50}, {width:50, height:1000}));
    game.addObject(new Block({x:50,y:50}, {width:50,height:1000}));
    game.addObject(new Block({x:50,y:1050}, {width:1050, height:50}));
    game.addObject(new Block({x:200,y:200}, {width:500, height:50}));
    game.addObject(new Block({x:400,y:290}, {width:50, height:500}));
    game.addObject(new Block({x:600,y:500}, {width:50, height:550}));
    game.addObject(new Block({x:500,y:500}, {width:50, height:50}));
    game.addObject(new Block({x:450,y:600}, {width:50, height:50}));
    game.addObject(new Block({x:550,y:600}, {width:50, height:50}));
    game.addObject(new Block({x:500,y:700}, {width:50, height:50}));

    // TEST OBJECTS.
    var testPlayer = new Player({x: 100, y: 100}, 'img/player.png', 5);
    testPlayer.setVel({x: 1, y: 1});
    game.addObject(testPlayer);
    //game.addObject(new Shot(testPlayer), { x: 400, y: 400 });
    //game.addObject(new Shot(testPlayer), { x: 100, y: 400 });
    //game.addObject(new Shot(testPlayer), { x: 400, y: 100 });
}

function stringifyGameObjects(gameObjects) {
    var stringedObjects = [];

    gameObjects.forEach(function(element) {
        stringedObjects.push(element.toTransit());
    }, this);

    return stringedObjects;
}