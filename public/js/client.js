document.addEventListener('DOMContentLoaded', function() {
    game = new Game();
    
    game.addObject(new Player({x: 500, y: 400}, Game.IMG_PLAYER));
    game.addObject(new Player({x: 700, y: 400}, Game.IMG_PLAYER_2));

    game.run();

});