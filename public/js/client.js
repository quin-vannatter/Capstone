var canvas;
var context;

var game;
var player;
var input;
var camera;
var mapBounds;

var socket;

var playGame = false;

//var serverIP = '142.156.127.137:3700';
var serverIP = '142.156.127.156:3700';

document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('canvas');

    initSocket();

    // Prevent right-click from bringing up context menu;
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

    context = canvas.getContext('2d');
    resizeCanvas();

	window.addEventListener('resize', resizeCanvas);

    setInterval(function() {
        if (playGame) {
            if(!player.getKill())updateInput();
            game.update();
            camera.update();
            drawGame();
        }
    }, Game.UPDATE_INTERVAL);
});

function initSocket() {
    socket = io(serverIP);

    socket.on('connect', function(data) {
        
    });

    socket.on('initialize game', function(data) {
        initGame(data);
    });

    socket.on('spawn player', function(data) {
        player = new Player(data.loc, 'img/player.png', data.playerId);

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

    socket.on('update all players', function(data) {
        updatePlayerPositions(data);
        updateInput();
    });
}

function updatePlayerPositions(players) {
    for(var i = 0; i < players.length; i++) {
        var cP = players[i];

        game.updateVelAndLocRange(cP.playerId, cP.loc, cP.velocity);
    }
}

function drawGame() {
    // Draw the background for the canvas.
    context.clearRect(0, 0, canvas.width, canvas.height)
    
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
            
            // Draw the game object.
            context.drawImage(g.getTex(), loc.x - deltaX, loc.y - deltaY,
                size.width * (2 - alpha),size.height * (2 - alpha));

            // Reset the alpha if it wasn't 1.
            if(alpha != 1) context.globalAlpha = 1;
        }
    });
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

        var mapBounds = game.getMapBounds(player);

        mouseLoc.x = Math.max(Math.min(mapBounds.max.x,mouseLoc.x),mapBounds.min.x);
        mouseLoc.y = Math.max(Math.min(mapBounds.max.y,mouseLoc.y),mapBounds.min.y);

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

    playGame = true;
}

function createObjectFromTransit(tObj) {
    switch (tObj.type) {
        case 'Block':
            return new Block(tObj.loc, tObj.size);

        case 'Player':
            var newPlayer = new Player(tObj.loc, 'img/player2.png', tObj.playerId);
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
