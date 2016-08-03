var canvas;
var context;

var game;
var player;
var input;
var camera;

document.addEventListener('DOMContentLoaded', function() {
    canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    resizeCanvas();
    
	window.addEventListener('resize', resizeCanvas);

    initGame();

    setInterval(function() {
        game.update();
        camera.update();
        drawGame();
    }, Game.UPDATE_INTERVAL);
});

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

/**
 * Initializes this game.
 */
function initGame() {
    game = new Game();


    player = new Player({x: 400, y: 400}, 'img/player.png', 1, Input.getEmptyInput());
    camera = new Camera(player, canvas);
    input = new Input(canvas, camera);

    

    game.addObject(player);
    game.addObject(new Player({x: 200, y: 400}, 'img/player2.png'));
}

/**
 * Resizes the canvas to match the window.
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    if(typeof(camera) !== 'undefined') { camera.reCenter(); }
}
