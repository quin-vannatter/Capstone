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
var shortid = require('shortid');

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

const SYNC_INTERVAL = 0.1 * 60;
var currentSync = SYNC_INTERVAL;

var ONE_CLIENT_PER_IP = false;

var numClients = 0;
var clientIPs = [];

var Game = gameJS.Game;

var game = new Game();

initGame(game);

// Run game if there is at least one player.
setInterval(function() {
    if (numClients > 0) {
        game.update();
        
        var players = game.getAllPlayers();
        checkRespawns(players);

        currentSync--;
        if (currentSync <= 0) {
            currentSync = SYNC_INTERVAL;
            io.emit('update all players', game.getPlayersForTransit());
        }
    }
}, Game.UPDATE_INTERVAL);


// Setup socket on-connect.
io.on('connection', function (socket) {
    numClients++;

    if (ONE_CLIENT_PER_IP && clientIPs.indexOf(socket.conn.remoteAddress) !== -1) {
        socket.disconnect();
        return;
    }

    clientIPs.push(socket.conn.remoteAddress);
    socket.playerId = shortid.generate();

    // Send the joining player the game.
    var initialGameState = {
        gameObjects: stringifyGameObjects(game.getGameObjects())
    };
    
    socket.emit('initialize game', initialGameState);
    
    // Create the new player object and add it to the game.
    var loc = game.getRandomSpawnLocation();

    var newPlayer = new Player(loc, null, socket.playerId);
    game.addObject(newPlayer);

    // Send the player their spawn location.
    var playerInfo = {
        playerId: socket.playerId,
        loc: loc
    };

    socket.emit('spawn player', playerInfo);

    // Send the new player to all other players.
    socket.broadcast.emit('player joined', newPlayer.toTransit());

    console.log('\tClient connected(' + numClients + '): ' + socket.playerId);

    socket.on('error', function (err) {
        console.error(err);
    });

    socket.on('shot attempt', function (data) {
        var result = game.attemptShot(socket.playerId, data);

        if (result !== null) {
            socket.broadcast.emit('player shot', result.toTransit());
        }
    });

    socket.on('update movement', function(data) {
        var player = game.getPlayerById(socket.playerId);
        var loc = player.getLoc();

        if (game.getDistance(player.getLoc(), data.loc) > game.TRUST_DISTANCE) {
            socket.emit('update own position', loc);
        } else {
            loc = data.loc;
            player.setLoc(loc);
        }

        player.setVel(data.vel);

        var newInfo = {
            playerId: socket.playerId,
            vel: data.vel,
            loc: loc
        };

        // Broadcast new player movement to other players.
        socket.broadcast.emit('player moved', newInfo);
    });

    socket.on('teleport attempt', function(data) {
        var player = game.getPlayerById(socket.playerId);
        
        if (player.canTeleport()) {
            player.teleport(data);

            var returnData = {
                playerId: socket.playerId,
                loc: data
            };

            socket.broadcast.emit('player teleported', returnData);
        }
    });

    /**
     * Event for when a client disconnects. Removes player from the game.
     */
    socket.on('disconnect', function () {
        console.log('\t User disconnected(' + numClients + '): ' + socket.playerId);
        
        numClients--;

        game.removePlayer(socket.playerId);
        
        var ipIndex = clientIPs.indexOf(socket.conn.remoteAddress);
        clientIPs.splice(ipIndex, 1);

        socket.broadcast.emit('player quit', socket.playerId);
    });
});

function initGame(game) {
    // Outside walls.
    game.addObject(new Block({x:-450,y:50,}, {width:1550, height:50})); // top
    game.addObject(new Block({x:1050,y:50}, {width:50, height:1000}));  // right
    game.addObject(new Block({x:-450,y:50}, {width:50,height:1000}));   // left
    game.addObject(new Block({x:-450,y:1050}, {width:1550, height:50})); // bottom


    // Top left box.
    game.addObject(new Block({x:-250,y:200}, {width:200, height:50}));
    game.addObject(new Block({x:-250,y:250}, {width:50, height:100}));
    game.addObject(new Block({x:-100,y:250}, {width:50, height:100}));
    game.addObject(new Block({x:-250,y:350}, {width:200, height:50}));



    game.addObject(new Block({x:200,y:200}, {width:500, height:50}));
    game.addObject(new Block({x:400,y:290}, {width:50, height:200}));
    game.addObject(new Block({x:400,y:520}, {width:50, height:300}));
    game.addObject(new Block({x:600,y:500}, {width:50, height:550}));
    game.addObject(new Block({x:500,y:500}, {width:50, height:50}));
    game.addObject(new Block({x:450,y:600}, {width:50, height:50}));
    game.addObject(new Block({x:550,y:600}, {width:50, height:50}));
    game.addObject(new Block({x:500,y:700}, {width:50, height:50}));
    game.addObject(new Block({x:850,y:300}, {width:50, height:400}));
    game.calculateMapBounds();
}

function stringifyGameObjects(gameObjects) {
    var stringedObjects = [];

    gameObjects.forEach(function(element) {
        stringedObjects.push(element.toTransit());
    }, this);

    return stringedObjects;
}

function checkRespawns(players) {
    for(var i = 0; i < players.length; i++) {
        if (players[i].getKill() && players[i].getRespawnTime() <= 0) {
            var loc = game.getRandomSpawnLocation();

            players[i].respawnPlayer(loc);

            var data = {
                playerId: players[i].getId(),
                loc: loc
            };

            io.emit('respawn player', data);
        } else if (!players[i].getKill() && players[i].getHealth() <= 0) {
            players[i].killPlayer();
            io.emit('player died', players[i].getId());
        }
    }
}