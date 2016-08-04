var canvas;
var context;

var game;
var player;
var input;
var camera;

var socket;

var playGame = false;

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

    //initGame();

    setInterval(function() {
        if (playGame) {
            updateInput();
            game.update();
            camera.update();
            drawGame();
        }
    }, Game.UPDATE_INTERVAL);
});

function initSocket() {
    socket = io(serverIP);

    socket.on('connect', function(data) {
        console.log('connected');
    });

    socket.on('initialize game', function(data) {
        initGame(data);
    });

    socket.on('player joined', function(data) {
        game.addObject(new Player({x: 200, y: 400}, 'img/player2.png'));
        console.log('player joined');
    });
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

    player.setVel(velocity);
}

function processMouse(i, io) {

    // Get mouse coordinates.
    if (i.teleport && !io.teleport) {

        // Get the position of the mouse.
        var cursor = input.getCursor();

        // Get the player size.
        var size = player.getSize();

        var mouseLoc = {
            x: cursor.x - (size.width / 2),
            y: cursor.y - (size.height / 2)
        };

        player.teleport(mouseLoc);
    }

    if (i.shoot && !io.shoot) {
        if (player.getPower() >= player.getPowerPerShot()) {
            var mouseLoc = {
                x: input.getCursor().x,
                y: input.getCursor().y
            };

            player.subrtactShotPower();
            game.addObject(new Shot(player, mouseLoc));
        }
    }
}

function updateInput() {
    var result = input.getChanges();
    var i = input.getInput();
    var io = input.getOldInput();

    processMovement(i);
    processMouse(i, io);

    input.updateOld();

    if(result.changed) {
       // send to server.
    }
}

function updatePlayerVelocity() {
    
    if(input.up) { velocity.y = -1; }
    else if(input.down) { velocity.y = 1; }
    
    if(input.left) { velocity.x = -1; }
    else if(input.right) { velocity.x = 1; }
    
    if(input.shoot && !inputOld.shoot && player.getPower() > player.getPowerPerShot()) {
        player.subrtactShotPower();
        this.gameObjects.push(new Shot(player,cursor));
    }

    player.setVel(velocity);
}

/**
 * Initializes this game.
 */
function initGame(gameData) {
    game = new Game();

    player = new Player({x: 400, y: 400}, 'img/player.png', gameData.playerId);

/*
    console.log(JSON.stringify(flatten(player)));
    console.log(JSON.stringify(player));
    console.log(JSON.stringify(new Block({x:50,y:50,}, {width:1000, height:50})));
    console.log(JSON.stringify(gameData.gameObjects[0]));
*/

    camera = new Camera(player, canvas);
    input = new Input(canvas, camera);

    //console.log(gameData);
    gameData.gameObjects.forEach(function(element) {
        //var newObj = createObjectFromTransit(element);

        game.addObject(createObjectFromTransit(element));
    }, this);

    game.addObject(player);

    playGame = true;
    /*
    game.addObject(new Player({x: 200, y: 400}, 'img/player2.png'));
    game.addObject(new Player({x: 300, y: 300}, 'img/player2.png'));
    game.addObject(new Player({x: 500, y: 200}, 'img/player2.png'));
    */

    /*
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
    */
}

function createObjectFromTransit(tObj) {
    switch (tObj.type) {
        case 'Block':
            return new Block(tObj.loc, tObj.size);

        case 'Player':
            console.log(tObj);
            return new Player(tObj.loc, 'img/player2.png', tObj.playerId);
            
        case 'Shot':
            console.log(tObj);

            break;
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
