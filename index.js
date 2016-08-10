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

var maps = [{"blocks":[{"location":{"x":0,"y":0},"size":{"width":1,"height":30}},{"location":{"x":1,"y":29},"size":{"width":29,"height":1}},{"location":{"x":29,"y":0},"size":{"width":1,"height":29}},{"location":{"x":1,"y":0},"size":{"width":28,"height":1}},{"location":{"x":4,"y":5},"size":{"width":1,"height":5}},{"location":{"x":5,"y":8},"size":{"width":5,"height":1}},{"location":{"x":17,"y":4},"size":{"width":1,"height":3}},{"location":{"x":18,"y":4},"size":{"width":4,"height":1}},{"location":{"x":21,"y":5},"size":{"width":1,"height":3}},{"location":{"x":17,"y":7},"size":{"width":4,"height":1}},{"location":{"x":18,"y":11},"size":{"width":1,"height":5}},{"location":{"x":19,"y":13},"size":{"width":8,"height":1}},{"location":{"x":23,"y":9},"size":{"width":1,"height":4}},{"location":{"x":4,"y":12},"size":{"width":9,"height":1}},{"location":{"x":6,"y":10},"size":{"width":7,"height":1}},{"location":{"x":15,"y":13},"size":{"width":1,"height":8}},{"location":{"x":18,"y":19},"size":{"width":9,"height":1}},{"location":{"x":21,"y":16},"size":{"width":6,"height":1}},{"location":{"x":6,"y":3},"size":{"width":8,"height":1}},{"location":{"x":8,"y":6},"size":{"width":7,"height":1}},{"location":{"x":6,"y":16},"size":{"width":5,"height":1}},{"location":{"x":6,"y":17},"size":{"width":1,"height":3}},{"location":{"x":2,"y":14},"size":{"width":1,"height":6}},{"location":{"x":5,"y":20},"size":{"width":7,"height":1}},{"location":{"x":9,"y":18},"size":{"width":4,"height":1}},{"location":{"x":12,"y":7},"size":{"width":1,"height":3}},{"location":{"x":24,"y":9},"size":{"width":5,"height":1}},{"location":{"x":19,"y":23},"size":{"width":10,"height":1}},{"location":{"x":19,"y":24},"size":{"width":1,"height":3}},{"location":{"x":22,"y":26},"size":{"width":5,"height":1}},{"location":{"x":3,"y":23},"size":{"width":1,"height":4}},{"location":{"x":4,"y":26},"size":{"width":13,"height":1}},{"location":{"x":7,"y":23},"size":{"width":9,"height":1}},{"location":{"x":25,"y":3},"size":{"width":1,"height":4}},{"location":{"x":23,"y":20},"size":{"width":1,"height":3}}],"spawns":[{"x":16,"y":9},{"x":3,"y":3},{"x":5,"y":22},{"x":20,"y":21},{"x":27,"y":21},{"x":27,"y":11},{"x":27,"y":2},{"x":19,"y":2},{"x":2,"y":27},{"x":27,"y":27},{"x":7,"y":14}]},
{"blocks":[{"location":{"x":0,"y":0},"size":{"width":1,"height":30}},{"location":{"x":1,"y":29},"size":{"width":29,"height":1}},{"location":{"x":29,"y":1},"size":{"width":1,"height":28}},{"location":{"x":1,"y":0},"size":{"width":29,"height":1}},{"location":{"x":3,"y":3},"size":{"width":1,"height":4}},{"location":{"x":4,"y":6},"size":{"width":3,"height":1}},{"location":{"x":6,"y":3},"size":{"width":1,"height":3}},{"location":{"x":4,"y":3},"size":{"width":2,"height":1}},{"location":{"x":23,"y":3},"size":{"width":4,"height":1}},{"location":{"x":23,"y":4},"size":{"width":1,"height":3}},{"location":{"x":24,"y":6},"size":{"width":3,"height":1}},{"location":{"x":26,"y":4},"size":{"width":1,"height":2}},{"location":{"x":9,"y":3},"size":{"width":1,"height":8}},{"location":{"x":3,"y":10},"size":{"width":6,"height":1}},{"location":{"x":20,"y":3},"size":{"width":1,"height":8}},{"location":{"x":21,"y":10},"size":{"width":6,"height":1}},{"location":{"x":13,"y":3},"size":{"width":1,"height":11}},{"location":{"x":3,"y":13},"size":{"width":10,"height":1}},{"location":{"x":16,"y":3},"size":{"width":1,"height":11}},{"location":{"x":17,"y":13},"size":{"width":10,"height":1}},{"location":{"x":3,"y":16},"size":{"width":5,"height":1}},{"location":{"x":10,"y":16},"size":{"width":4,"height":1}},{"location":{"x":16,"y":16},"size":{"width":4,"height":1}},{"location":{"x":22,"y":16},"size":{"width":5,"height":1}},{"location":{"x":26,"y":17},"size":{"width":1,"height":4}},{"location":{"x":3,"y":17},"size":{"width":1,"height":4}},{"location":{"x":6,"y":19},"size":{"width":18,"height":1}},{"location":{"x":14,"y":20},"size":{"width":1,"height":8}},{"location":{"x":15,"y":20},"size":{"width":1,"height":8}},{"location":{"x":18,"y":26},"size":{"width":9,"height":1}},{"location":{"x":26,"y":23},"size":{"width":1,"height":3}},{"location":{"x":18,"y":23},"size":{"width":7,"height":1}},{"location":{"x":3,"y":26},"size":{"width":9,"height":1}},{"location":{"x":3,"y":23},"size":{"width":1,"height":3}},{"location":{"x":5,"y":23},"size":{"width":7,"height":1}}],"spawns":[{"x":2,"y":27},{"x":27,"y":27},{"x":27,"y":2},{"x":2,"y":2},{"x":6,"y":8},{"x":22,"y":8},{"x":19,"y":11},{"x":10,"y":11},{"x":5,"y":18},{"x":24,"y":18},{"x":17,"y":25},{"x":12,"y":25},{"x":17,"y":2},{"x":12,"y":2}]}
];

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

var currentMap = 1;

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
        gameObjects: stringifyGameObjects(game.getGameObjects()),
        spawns: game.getSpawnLocations()
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
    loadMap(maps[currentMap]);
    game.calculateMapBounds();
}

function loadMap(map) {
    var BLOCK_SIZE = {
        WIDTH: 50,
        HEIGHT: 50
    };
    for(var i = 0;i<map.blocks.length;i++) {
        var b = map.blocks[i];

        var location = {
            x: b.location.x * BLOCK_SIZE.WIDTH,
            y: b.location.y * BLOCK_SIZE.HEIGHT
        };

        var size = {
            width: b.size.width * BLOCK_SIZE.WIDTH,
            height: b.size.height * BLOCK_SIZE.HEIGHT
        };
        game.addObject(new Block(location,size));
    }
    var spawns = [];
    for(var i = 0;i<map.spawns.length;i++) {
        var s = map.spawns[i];
        spawns.push({
            x: s.x * BLOCK_SIZE.WIDTH,
            y: s.y * BLOCK_SIZE.HEIGHT
        });
    }
    game.setSpawnLocations(spawns);
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