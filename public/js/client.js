var canvas;
var context;

var game;
var player;
var input;
var camera;

var backgroundImg;
var backgroundPattern;

var socket;

var playGame = false;

var COLOUR_HEALTH = 'red';
var COLOUR_KD = '#125E66';
var COLOUR_NAME = 'black';
var COLOUR_LEADERBOARD = '#126632';

var TEXT_NAME = '15px Verdana';
var TEXT_KD = '15px Verdana';
var TEXT_LEADER_HEADING = '25px Verdana';
var TEXT_LEADER = '18px Verdana';

var playerName = '';

var serverIP;

document.addEventListener('DOMContentLoaded', function() {
    serverIP = location.href;
    canvas = document.getElementById('canvas');
    document.getElementById('play').addEventListener('click', function () {
        playerName = document.getElementById('playerName').value;

        document.getElementById('input').style.display = 'none';
        document.getElementById('canvas').style.display = 'block';

        initSocket();
    });

    // Prevent right-click from bringing up context menu;
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

    context = canvas.getContext('2d');
    resizeCanvas();

    backgroundImg = new Image();
    backgroundImg.src = 'img/bg.png';

    healthBarImg = new Image();
    healthBarImg.src = 'img/healthbar.png';

	window.addEventListener('resize', resizeCanvas);

    setInterval(function() {
        if (playGame) {
            if(!player.getKill()) {
                updateInput();
            }
            game.update();
            camera.update();
            drawGame();
        }
    }, Game.UPDATE_INTERVAL);

    document.getElementById('playerName').focus();
});

function initSocket() {
    socket = io(serverIP,{ query: 'playerName=' + playerName });

    socket.on('connect', function(data) {
        
    });

    socket.on('initialize game', function(data) {
        initGame(data);
    });

    socket.on('spawn player', function(data) {
        player = new Player(data.loc, 'img/player.png', data.playerId, playerName);

        camera = new Camera(player, canvas);
        input = new Input(canvas, camera);

        game.addObject(player);
    });
    
    socket.on('player joined', function(data) {
        game.addObject(createObjectFromTransit(data));
    });

    socket.on('player quit', function (playerId) {
        game.removePlayer(playerId);
    });

    socket.on('player shot', function(data) {
        game.addObject(createObjectFromTransit(data));
    });

    socket.on('player moved', function(data) {
        game.updatePlayerLocAndVel(data.playerId, data.loc, data.vel);
    });

    socket.on('player teleported', function(data) {
        var teleporter = game.getPlayerById(data.playerId);
        
        teleporter.teleport(data.loc);
    });

    socket.on('update own position', function(data) {
        player.setLoc(data);
    });

    socket.on('respawn player', function(data) {
        var respawner = game.getPlayerById(data.playerId);

        respawner.respawnPlayer(data.loc);
    });

    socket.on('player died', function(data) {
        var dieingPlayer = game.getPlayerById(data);

        dieingPlayer.killPlayer();
    });

    socket.on('update all players', function(data) {
        for (var i = 0; i < data.length; i++) {
            var updatingPlayer = game.getPlayerById(data[i].playerId);

            if (updatingPlayer.getId() !== player.getId()) {
                updatingPlayer.setUpdateLoc(data[i].loc);
                updatingPlayer.setVel(data[i].velocity);
            }
            
            // Update the health if it is off by a lot.
            if (Math.abs(updatingPlayer.getHealth() - data[i].health) > 15) {
                updatingPlayer.setHealth(data[i].health);
            }

            // Update K/Ds.
            updatingPlayer.setNumKills(data[i].numKills);
            updatingPlayer.setNumDeaths(data[i].numDeaths);
        }
    });
}

function drawGame() {

    // Draw the background for the canvas.
    context.clearRect(0, 0, canvas.width, canvas.height);

    backgroundPattern = context.createPattern(backgroundImg, 'repeat');
    context.fillStyle = backgroundPattern;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Loop through the game objects.
    game.getGameObjects().forEach(function(g) {

        // If the game object has something to draw.
        if(g.getTex() != null) {

            // Get the alpha of the game object.
            var alpha = g.getAlpha();

            // Calculate the position relative to the camera.
            var loc = camera.calculateOffset(g);
            var size = g.getSize();
            var deltaX = ((size.width * (2 - alpha)) - size.width)/2;
            var deltaY = ((size.height * (2 - alpha)) - size.height)/2;

            // Set the alpha if it isn't 1.
            if(alpha != 1) {
                context.globalAlpha = alpha;
            }
            
            if(!g.isPattern()) {
                var objSize = {
                    width: size.width * (2 - alpha),
                    height: size.height * (2 - alpha)
                };

                // Draw the game object.
                context.drawImage(g.getTex(), loc.x - deltaX, loc.y - deltaY,
                    objSize.width, objSize.height);

                // Draw player related stuff if they are not teleporting.
                if (g.constructor.name === 'Player' && !g.getTeleporting()) {

                    // Draw health if the player has less than 100%.
                    if (g.getHealthPercent() !== 1) {
                        var hbo = g.getHealthBarOffset(objSize.height);
                        var hbs = g.getHealthBarSize();

                        var hbl = {
                            x: loc.x - deltaX + hbo.x,
                            y: loc.y - deltaY + hbo.y
                        };

                        var healthOffsets = g.getHealthOffsetInBar();

                        var healthDim = {
                            x: hbl.x + healthOffsets.x,
                            y: hbl.y + healthOffsets.y,
                            width: g.getHealthPercent() * healthOffsets.width,
                            height: healthOffsets.height
                        };

                        context.fillStyle = COLOUR_HEALTH;
                        context.fillRect(healthDim.x, healthDim.y, healthDim.width, healthDim.height);
                        context.drawImage(healthBarImg, hbl.x, hbl.y, hbs.width, hbs.height);
                    }

                    // Draw kills and deaths.
                    var kdo = g.getKDOffset(objSize.height);

                    var kdl = {
                        x: loc.x - deltaX + kdo.x,
                        y: loc.y - deltaY + kdo.y
                    };

                    // Measure string width.
                    var kdString = g.getKDString();
                    var stringWidth = context.measureText(kdString).width;

                    context.font = TEXT_KD;
                    context.fillStyle = COLOUR_KD;
                    context.fillText(kdString, kdl.x - (stringWidth / 2), kdl.y);

                    // Draw name.
                    var no = g.getNameffset(objSize.height);

                    var nl = {
                        x: loc.x - deltaX + no.x,
                        y: loc.y - deltaY + no.y
                    };

                    // Measure string width.
                    var nameString = g.getName();
                    stringWidth = context.measureText(nameString).width;

                    context.font = TEXT_NAME;
                    context.fillStyle = COLOUR_NAME;
                    context.fillText(nameString, nl.x - (stringWidth / 2), nl.y);
                }
            } else {

                context.translate(loc.x - deltaX, loc.y - deltaY)
                var pattern = context.createPattern(g.getTex(),"repeat");

                context.fillStyle = pattern;
                context.fillRect(0,0, size.width * (2 - alpha),size.height * (2 - alpha));
                context.translate(-(loc.x - deltaX), -(loc.y - deltaY));
            }

            // Reset the alpha if it wasn't 1.
            if (alpha !== 1) {
                context.globalAlpha = 1;
            }
        }
    });
    
    // Leaderboard.
    var leaders = game.getLeaders();
    var ltp = {
        x: 10,
        y: 60,
        height: 20,
        headY: 25,
        baseWidth: 190,
        baseHeight: 47,
        heightPerPlayer: 20
    };

    var currentAlpha = context.globalAlpha;

    context.globalAlpha = 0.2;
    context.fillRect(0, 0, ltp.baseWidth, ltp.baseHeight + (leaders.length * ltp.heightPerPlayer));
    
    context.globalAlpha = currentAlpha;

    context.fillStyle = COLOUR_LEADERBOARD;
    
    context.font = TEXT_LEADER_HEADING;
    context.fillText('SCOREBOARD', ltp.x, ltp.headY);

    context.font = TEXT_LEADER;
    context.fillStyle = COLOUR_LEADERBOARD;

    for (var i = 0; i < leaders.length; i++) {
        context.fillText(leaders[i].getLeaderString(), ltp.x, ltp.y + i * ltp.height);
    }
}

function processMovement(i) {
    var velocity = {
        x: 0,
        y: 0
    };

    if (i.up) { velocity.y = -1; }
    else if (i.down) { velocity.y = 1; }
    if (i.left) { velocity.x = -1; }
    else if (i.right) { velocity.x = 1; }

    velocity = Vector.multiply(Vector.normalize(velocity), player.speed);

    var updateData = {
        loc: player.getLoc(),
        vel: velocity
    };

    socket.emit('update movement', updateData);

    player.setVel(velocity);
}

function processMouse(i, io) {
    if (i.teleport && !io.teleport && player.canTeleport()) {
        // Get the position of the mouse.
        var cursor = input.getCursor();

        // Get the player size.
        var size = player.getSize();

        // Get mouse coordinates.
        var mouseLoc = {
            x: cursor.x - (size.width / 2),
            y: cursor.y - (size.height / 2)
        };

        var mapBounds = game.mapBounds;

        mouseLoc.x = Math.max(Math.min(mapBounds.max.x - size.width,mouseLoc.x),mapBounds.min.x);
        mouseLoc.y = Math.max(Math.min(mapBounds.max.y - size.height,mouseLoc.y),mapBounds.min.y);

        if(!intersectingPlayer(mouseLoc)) { 
            player.teleport(mouseLoc)

            socket.emit('teleport attempt', mouseLoc);
        };
    }

    if (i.shoot && !io.shoot) {
        var mouseLoc = {
            x: input.getCursor().x,
            y: input.getCursor().y
        };

        if (game.attemptShot(player.getId(), mouseLoc) !== null) {
            // Send shot request to server.
            socket.emit('shot attempt', mouseLoc);
        }
    }
}

function intersectingPlayer(location) {
    var found = false;
    game.getGameObjects().forEach(function(g) {
        if(g.constructor.name === "Player") {
            var loc = g.getLoc();
            var size = g.getSize();

            if(location.x > loc.x && location.x < loc.x + size.width && 
                location.y > loc.y && location.y < loc.y + size.height ){
                    found = true;
            }
        }
    });
    return found;
}

function updateInput() {
    var result = input.getChanges();
    var i = input.getInput();
    var io = input.getOldInput();

    if (result.changed) {
        processMovement(i);
        processMouse(i, io);
    }

    input.updateOld();
}

/**
 * Initializes this game.
 */
function initGame(gameData) {
    game = new Game();

    gameData.gameObjects.forEach(function(element) {
        game.addObject(createObjectFromTransit(element));
    }, this);

    game.setSpawnLocations(gameData.spawns);

    playGame = true;
    game.calculateMapBounds();
}

function createObjectFromTransit(tObj) {
    switch (tObj.type) {
        case 'Block':
            return new Block(tObj.loc, tObj.size);

        case 'Player':
            var newPlayer = new Player(tObj.loc, 'img/player2.png', tObj.playerId, tObj.playerName);
            newPlayer.setVel(tObj.velocity);

            return newPlayer;
            
        case 'Shot':
            return new Shot(tObj.ownerId, tObj.loc, tObj.vel);
    }
}

/**
 * Resizes the canvas to match the window.
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if(typeof(camera) !== 'undefined') { camera.reCenter(); }
}
