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

var maps = [[[[0,0,1,30],[1,29,29,1],[29,0,1,29],[1,0,28,1],[4,5,1,5],[5,8,5,1],[17,4,1,3],[18,4,4,1],[21,5,1,3],[17,7,4,1],[18,11,1,5],[19,13,8,1],[23,9,1,4],[4,12,9,1],[6,10,7,1],[15,13,1,8],[18,19,9,1],[21,16,6,1],[6,3,8,1],[8,6,7,1],[6,16,5,1],[6,17,1,3],[2,14,1,6],[5,20,7,1],[9,18,4,1],[12,7,1,3],[24,9,5,1],[19,23,10,1],[19,24,1,3],[22,26,5,1],[3,23,1,4],[4,26,13,1],[7,23,9,1],[25,3,1,4],[23,20,1,3]],[[16,9],[3,3],[5,22],[20,21],[27,21],[27,11],[27,2],[19,2],[2,27],[27,27],[7,14]]],

[[[0,0,1,30],[1,29,29,1],[29,1,1,28],[1,0,29,1],[3,3,1,4],[4,6,3,1],[6,3,1,3],[4,3,2,1],[23,3,4,1],[23,4,1,3],[24,6,3,1],[26,4,1,2],[9,3,1,8],[3,10,6,1],[20,3,1,8],[21,10,6,1],[13,3,1,11],[3,13,10,1],[16,3,1,11],[17,13,10,1],[3,16,5,1],[10,16,4,1],[16,16,4,1],[22,16,5,1],[26,17,1,4],[3,17,1,4],[6,19,18,1],[14,20,1,8],[15,20,1,8],[18,26,9,1],[26,23,1,3],[18,23,7,1],[3,26,9,1],[3,23,1,3],[5,23,7,1]],[[2,27],[27,27],[27,2],[2,2],[6,8],[22,8],[19,11],[10,11],[5,18],[24,18],[17,25],[12,25],[17,2],[12,2]]],

[[[0,0,1,20],[1,19,39,1],[39,0,1,19],[1,0,38,1],[37,1,1,2],[38,1,1,2],[3,16,4,1],[6,13,1,3],[3,13,3,1],[3,14,1,2],[11,16,1,3],[36,13,1,4],[33,16,3,1],[32,11,1,3],[33,12,1,1],[31,12,1,1],[29,7,8,1],[29,5,8,1],[29,6,1,1],[36,6,1,1],[15,6,1,11],[19,8,1,11],[4,4,13,1],[7,3,1,1],[10,2,1,1],[13,1,1,1],[22,3,3,1],[24,1,1,2],[25,7,1,9],[26,13,2,1],[23,9,2,1],[7,9,5,1],[16,9,1,2],[18,13,1,2]],[[2,2],[2,11],[8,17],[10,11],[8,6],[20,2],[27,2],[34,2],[34,10],[30,14],[23,11],[21,17]]]

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

var currentMap = 2;

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
    
    console.log('\tClient connected(' + numClients + '): ' + socket.playerId);

    socket.on('error', function (err) {
        console.error(err);
    });

    socket.on('join game', function(name) {
        var newPlayer = new Player(loc, null, socket.playerId, name);
        game.addObject(newPlayer);

        // Send the player their spawn location.
        var playerInfo = {
            playerId: socket.playerId,
            loc: loc
        };

        socket.emit('spawn player', playerInfo);

        // Send the new player to all other players.
        socket.broadcast.emit('player joined', newPlayer.toTransit());
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
            if (game.getDistance(data, player.getLoc()) > player.getMaxTeleport()) {
                var newVector = Vector.multiply(Vector.normalize(Vector.delta(data, player.getLoc())), player.getMaxTeleport());
                data = {
                    x: player.getLoc().x + newVector.x,
                    y: player.getLoc().y + newVector.y
                }
            }

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
    for(var i = 0;i<map[0].length;i++) {
        var b = map[0][i];

        var location = {
            x: b[0] * BLOCK_SIZE.WIDTH,
            y: b[1] * BLOCK_SIZE.HEIGHT
        };

        var size = {
            width: b[2] * BLOCK_SIZE.WIDTH,
            height: b[3] * BLOCK_SIZE.HEIGHT
        };
        game.addObject(new Block(location,size));
    }
    
    var spawns = [];
    for(var i = 0;i<map[1].length;i++) {
        var s = map[1][i];
        spawns.push({
            x: s[0] * BLOCK_SIZE.WIDTH,
            y: s[1] * BLOCK_SIZE.HEIGHT
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