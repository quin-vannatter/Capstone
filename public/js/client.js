var canvas;
var context;

var game;
var player;
var input;
var camera;

var socket;

var playGame = false;

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
    socket = io('142.156.127.156:3700');

    socket.on('connect', function(data) {
        console.log('connected');
    });

    socket.on('initialize game', function(data) {
        console.log(data);
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
            // Calculate the position relative to the camera.
            var loc = camera.calculateOffset(g);
            
            // Draw the game object.
            context.drawImage(g.getTex(), loc.x, loc.y,
                g.getSize().width,g.getSize().height);
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
    if (i.teleport) {
        var mouseLoc = {
            x: input.getCursor().x - (player.getSize().width / 2),
            y: input.getCursor().y - (player.getSize().height / 2)
        };

        player.setLoc(mouseLoc);
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

function flatten(obj) {
    var result = Object.create(obj);
    for(var key in result) {
        result[key] = result[key];
    }
    return result;
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
        console.log(element);
        game.addObject(element);
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

/**
 * Resizes the canvas to match the window.
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if(typeof(camera) !== 'undefined') { camera.reCenter(); }
}
