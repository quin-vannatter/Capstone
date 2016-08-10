
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

var blockSize = {
    width: BLOCK_SIZE.WIDTH,
    height: BLOCK_SIZE.HEIGHT
};

var mapSize = {
    width: MAP_SIZE.WIDTH,
    height: MAP_SIZE.HEIGHT
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
    canvas.width = mapSize.width * blockSize.width;
    canvas.height = mapSize.height * blockSize.height;
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

function loadCanvas() {
    var values = {
        mw: document.getElementById('mapWidth').value,
        mh: document.getElementById('mapHeight').value,
        bw: document.getElementById('blockWidth').value,
        bh: document.getElementById('blockHeight').value,
    }

    mapSize = {
        width: parseInt(values.mw) > 0 ? parseInt(values.mw) : MAP_SIZE.WIDTH,
        height: parseInt(values.mh) > 0 ? parseInt(values.mh) : MAP_SIZE.HEIGHT
    }

    blockSize = {
        width: parseInt(values.bw) > 0 ? parseInt(values.bw) : BLOCK_SIZE.WIDTH,
        height: parseInt(values.bh) > 0 ? parseInt(values.bh) : BLOCK_SIZE.HEIGHT
    }
    
    canvas.width = mapSize.width * blockSize.width;
    canvas.height = mapSize.height * blockSize.height;

    addingBlock = true;
    drawBlocks(false);
}

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
            x: Math.round((e.clientX - rect.left - blockSize.width/2)/blockSize.width),
            y: Math.round((e.clientY - rect.top - blockSize.height/2)/blockSize.height)
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
    for(var i = 0; i < mapSize.width; i++) {
        context.beginPath();
        context.moveTo(i*blockSize.height,0);
        context.lineTo(i*blockSize.height, mapSize.height * blockSize.height);
        context.stroke();
    }

    for(var i = 0; i < mapSize.height; i++) {
        context.beginPath();
        context.moveTo(0,i*blockSize.width);
        context.lineTo(mapSize.width * blockSize.width, i * blockSize.width);
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
        context.fillRect(block.location.x * blockSize.width, block.location.y * blockSize.height,
            block.size.width * blockSize.width, block.size.height * blockSize.height);
    }

    // Add each spawn.
    for(var i = 0;i<spawns.length;i++) {
        var spawn = spawns[i];
        context.fillStyle = SPAWN_STYLE;
        context.fillRect(spawn.x * blockSize.width, spawn.y * blockSize.height, 
            blockSize.width, blockSize.height);
    }

    // Add the starter block if this is a new block.
    if(withNewBlock) {
        context.fillStyle = BLOCK_STYLE;
        context.fillRect(newBlock.location.x * blockSize.width, newBlock.location.y * blockSize.height,
            newBlock.size.width * blockSize.width, newBlock.size.height * blockSize.height);
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