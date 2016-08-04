/*
// sending to sender-client only
socket.emit('message', "this is a test");

// sending to all clients, include sender
io.emit('message', "this is a test");

// sending to all clients except sender
socket.broadcast.emit('message', "this is a test");

// sending to all clients in 'game' room(channel) except sender
socket.broadcast.to('game').emit('message', 'nice game');

// sending to all clients in 'game' room(channel), include sender
io.in('game').emit('message', 'cool game');

// sending to sender client, only if they are in 'game' room(channel)
socket.to('game').emit('message', 'enjoy the game');

// sending to all clients in namespace 'myNamespace', include sender
io.of('myNamespace').emit('message', 'gg');

// sending to individual socketid
socket.broadcast.to(socketid).emit('message', 'for your eyes only');
*/


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

// Run game if there is at least one player.
setInterval(function() {
    if (io.sockets.clients.length > 0) {
        game.update();
    }

}, Game.UPDATE_INTERVAL);


// Setup socket on-connect.
io.on('connection', function (socket) {
    socket.playerId = uuid();

    // Send the joining player the game.
    var initialGameState = {
        gameObjects: stringifyGameObjects(game.getGameObjects()),
        playerId: socket.playerId
    };
    
    socket.emit('initialize game', initialGameState);
    
    // Create the new player object and add it to the game.
    var newPlayer = new Player({x: 300, y: 300}, null, socket.playerId);
    game.addObject(newPlayer);

    // Send the new player to all other players.
    socket.broadcast.emit('player joined', newPlayer.toTransit());

    console.log('\tClient connected: ' + socket.playerId);

    socket.on('error', function (err) {
        console.error(err);
    });

    socket.on('shot attempt', function (data) {
        var result = game.attemptShot(socket.playerId, data);

        if (result !== null) {
            socket.broadcast.emit('player shot', result.toTransit());
        }
    });

    /**
     * Event for when a client disconnects. Removes player from the game.
     */
    socket.on('disconnect', function () {
        console.log('\t User disconnected: ' + socket.playerId);

        game.removePlayer(socket.playerId);

        socket.broadcast.emit('player quit', socket.playerId);
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
    /*
    var tp = new Player({x: 100, y: 100}, 'img/player.png', 5);
    tp.setVel({x: 1, y: 1});
    game.addObject(tp);

    game.addObject(new Shot(tp.getId(), tp.getLoc(), tp.getSize(), { x: 220, y: 90 }));
    game.addObject(new Shot(tp.getId(), tp.getLoc(), tp.getSize(), { x: 220, y: 90 }));
    game.addObject(new Shot(tp.getId(), tp.getLoc(), tp.getSize(), { x: 220, y: 90 }));
    game.addObject(new Shot(tp.getId(), tp.getLoc(), tp.getSize(), { x: 220, y: 90 }));
    game.addObject(new Shot(tp.getId(), tp.getLoc(), tp.getSize(), { x: 220, y: 90 }));
    */
}

function stringifyGameObjects(gameObjects) {
    var stringedObjects = [];

    gameObjects.forEach(function(element) {
        stringedObjects.push(element.toTransit());
    }, this);

    return stringedObjects;
}