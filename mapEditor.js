
// Get the context and canvas.
var canvas;
var context;

// Blocks.
var blocks;

// Where players will spawn.
var spawns;

// Keeps track of actions the user makes.
var actions;

// The map.
var map;

// When true, drawing new block, false, increasing size of last block.
var addingBlock;

// Next added block.
var newBlock;

// Process of clicking.
var clicking;

// Map size.
const MAP_SIZE = {
    WIDTH: 30,
    HEIGHT: 30
};

// Each block size.
const BLOCK_SIZE = {
    WIDTH: 20,
    HEIGHT: 20
};

// Spawn fill style.
const SPAWN_STYLE = '#FF7700';

// Block fill style.
const BLOCK_STYLE = '#003322';

// Border for the canvas.
const CANVAS_BORDER = '1px solid #000000';

// Undo key for reversing mistakes.
const KEY_UNDO = 'KeyZ';

// Actions.
const ACTION_SPAWN = 'Spawn';
const ACTION_BLOCK = 'Block';

// When everything loads. Create stuff.
document.addEventListener('DOMContentLoaded', function() {
    
    // Get the canvas.
    canvas = document.getElementById('canvas');

    // Set the properties of the canvas.
    canvas.width = MAP_SIZE.WIDTH * BLOCK_SIZE.WIDTH;
    canvas.height = MAP_SIZE.HEIGHT * BLOCK_SIZE.HEIGHT;
    canvas.style.border = CANVAS_BORDER;

    // When the user clicks on the canvas.
    canvas.addEventListener('mousedown', canvasDraw);
    canvas.addEventListener('mouseup', canvasDraw);
    document.addEventListener('keyup',keyEvent);

    // Prevent right-click from bringing up context menu;
    canvas.oncontextmenu = function (e) {
        e.preventDefault();
    };

    blocks = [];
    spawns = [];
    actions = [];

    // The user starts by adding a block.
    addingBlock = true;

    // User is not clicking or pressing.
    clicking = false;

    // Get the context.
    context = canvas.getContext('2d');

    // Draw the grid.
    drawGrid();
});

// In the event a key is pressed.
function keyEvent(e) {
    if(e.code === KEY_UNDO) {
        undoAction();
    }
}

// When the user clicks on the canvas.
function canvasDraw(e) {

    // Add if mouse button 1, reset adding if button 2.
    if(clicking) {

        // Round mouse coords to fit map grid, add block at that point.
        var rect = canvas.getBoundingClientRect();
        var coords = {
            x: Math.round((e.clientX - rect.left - BLOCK_SIZE.WIDTH/2)/BLOCK_SIZE.WIDTH),
            y: Math.round((e.clientY - rect.top - BLOCK_SIZE.HEIGHT/2)/BLOCK_SIZE.HEIGHT)
        };

        if(e.which == 1) {
            addBlock(coords);
        } else if (e.which == 3) {
            addSpawn(coords);
        }
    }

    // Set clicking to true if mouse down.
    clicking = e.type === 'mousedown'
}

// Undos the last action the user did, spawn or block creation.
function undoAction() {
    if(actions.length > 0) {

        // Get the last action the user did.
        var lastAction = actions[actions.length - 1];

        // Reverse the last action the user did.
        switch (lastAction) {
            case ACTION_SPAWN:
                spawns.splice(spawns.length-1, 1);
                break;
            case ACTION_BLOCK:
                addingBlock = true;
                blocks.splice(blocks.length - 1, 1);
                break;
        }

        // Remove the last action and redraw everything.
        actions.splice(actions.length-1, 1);
        drawBlocks(false);
    }
}

function addSpawn(coords) {

    // Add an action for adding a spawn.
    actions.push(ACTION_SPAWN);

    // Check if a block has been created at that point.
    var found = false;
    for(var i = 0; i < spawns.length; i++) {
        spawn = spawns[i];
        found = found || (spawn.x == coords.x && spawn.y == coords.y);
    }

    if(!found) {
        spawns.push(coords);
    }

    // Draw the current blocks.
    drawBlocks();
}

// Creates a new block on the map.
function addBlock(coords) {

    // Add an action for adding a spawn.
    actions.push(ACTION_BLOCK);

    // Swap coords if new coords are less than old.
    if(!addingBlock) {
        if(coords.x < newBlock.location.x) {
            var tmp = coords.x;
            coords.x = newBlock.location.x;
            newBlock.location.x = tmp;
        }
        if(coords.y < newBlock.location.y) {
            var tmp = coords.y;
            coords.y = newBlock.location.y;
            newBlock.location.y = tmp;
        }
    }

    // Check if a block has been created at that point.
    var found = false;
    for(var i = 0; i < blocks.length; i++) {
        block = blocks[i];
        found = found || (block.location.x == coords.x && block.location.y == coords.y);
    }

    // If a block hasn't been added there.
    if(!found) {
        // If the block being added is the first block.
        if(addingBlock) {
            newBlock = {
                location: coords,
                size: {
                    width: 1,
                    height: 1
                }
            }
        } else {
            var size = {
                width: coords.x - newBlock.location.x + 1,
                height: coords.y - newBlock.location.y + 1
            }
            var onWidth = Math.max(size.width, size.height) == size.width;
            newBlock.size = {
                width: onWidth ? size.width : 1,
                height: onWidth ? 1 : size.height
            }
            blocks.push(newBlock);
        }
    }

    // Draw all the blocks.
    drawBlocks(addingBlock);

    // Toggle the adding block.
    addingBlock = !addingBlock;
}

// Draws a grid for the map.
function drawGrid() {
    context.clearRect(0,0,canvas.width,canvas.height);
    for(var i = 0; i < MAP_SIZE.WIDTH; i++) {
        context.beginPath();
        context.moveTo(i*BLOCK_SIZE.HEIGHT,0);
        context.lineTo(i*BLOCK_SIZE.HEIGHT, MAP_SIZE.HEIGHT * BLOCK_SIZE.HEIGHT);
        context.stroke();
    }

    for(var i = 0; i < MAP_SIZE.HEIGHT; i++) {
        context.beginPath();
        context.moveTo(0,i*BLOCK_SIZE.WIDTH);
        context.lineTo(MAP_SIZE.WIDTH * BLOCK_SIZE.WIDTH, i * BLOCK_SIZE.WIDTH);
        context.stroke();
    }
}

// Draws all the blocks recorded.
function drawBlocks(withNewBlock) {

    // Start by clearing the map and drawing the grid.
    drawGrid();

    // Add each block.
    for(var i = 0;i<blocks.length;i++) {
        var block = blocks[i];
        context.fillStyle = BLOCK_STYLE;
        context.fillRect(block.location.x * BLOCK_SIZE.WIDTH, block.location.y * BLOCK_SIZE.HEIGHT,
            block.size.width * BLOCK_SIZE.WIDTH, block.size.height * BLOCK_SIZE.HEIGHT);
    }

    // Add each spawn.
    for(var i = 0;i<spawns.length;i++) {
        var spawn = spawns[i];
        context.fillStyle = SPAWN_STYLE;
        context.fillRect(spawn.x * BLOCK_SIZE.WIDTH, spawn.y * BLOCK_SIZE.HEIGHT, 
            BLOCK_SIZE.WIDTH, BLOCK_SIZE.HEIGHT);
    }

    // Add the starter block if this is a new block.
    if(withNewBlock) {
        context.fillStyle = BLOCK_STYLE;
        context.fillRect(newBlock.location.x * BLOCK_SIZE.WIDTH, newBlock.location.y * BLOCK_SIZE.HEIGHT,
            newBlock.size.width * BLOCK_SIZE.WIDTH, newBlock.size.height * BLOCK_SIZE.HEIGHT);
    }
}

// Creates the output for all the blocks.
function getBlocks() {
    map = {
        blocks: blocks,
        spawns: spawns
    }

    document.getElementById('jsonValue').value = JSON.stringify(map);
}

// Loads a json object into the map editor.
function loadBlocks() {
    map = JSON.parse(document.getElementById('jsonValue').value);

    spawns = map.spawns;
    blocks = map.blocks;

    drawGrid();
    drawBlocks(false);
    addingBlock = true;
}