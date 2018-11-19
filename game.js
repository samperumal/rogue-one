var gameState = {};

// Called on game startup
function initialise() {
    // Setup global game state
    gameState = {
        // Display state
        gfx: {
            cellSize: 25,
        },
        // Player state
        player: {
            x: 0,
            y: 0
        },
        // Map data
        mapData : null,
        // Convenience copy of above for display
        mapArray: null,
    };

    // Setup dictionary mapping symbols to css classes
    initClassMap();
    // Capture display elements drawing/update operations
    gameState.gfx.svg = d3.select("#gfx");
    gameState.gfx.floor = gameState.gfx.svg.append("g").attr("class", "floor");

    // Call promise chain to load and draw map from file
    loadMap()
        .then(draw)
        .then(update)
        .then(function () {
            d3.select("#in")
                .on("keydown", processInput)
                .node()
                .focus();
            console.log("Loaded");
        });
}

// Draw map when first loaded
function draw() {
    console.log("Drawing map");

    var gfx = gameState.gfx;

    // Bind cell data to SVG groups
    var allCells = gfx.floor.selectAll("g.cell")
        .data(gameState.mapArray, d => d.i);

    // Create display elements for new data
    allCells.enter()
        .append("g").attr("class", "cell")
        .attr("transform", d => "translate(" + (d.x * gfx.cellSize) + "," + (d.y * gfx.cellSize) + ")")
        .append("text")
        .attr("transform", d => "translate(" + (gfx.cellSize / 2) + "," + (gfx.cellSize / 2) + ")");

    // Remove display elements for removed elements
    allCells.exit().remove();
}

// Update map after actions
function update() {
    console.log("Updating map");
    var gfx = gameState.gfx;

    // Update cell css class and text symbol
    gfx.floor.selectAll("g.cell text")
        .attr("class", d => gfx.colors[d.s()])
        .text(d => d.s());
}

// Process key input
function processInput(d) {
    switch (d3.event.code) {
        case "KeyW": requestMove(0, -1); break;
        case "KeyS": requestMove(0, 1); break;
        case "KeyA": requestMove(-1, 0); break;
        case "KeyD": requestMove(1, 0); break;
        default: return;
    }

    // Clear textbox
    d3.select("#in").property("value", "");

    // Redraw map
    update();
}

// Attempt to move to new cell
function requestMove(x, y) {
    var player = gameState.player;
    var currentCell = gameState.mapData[player.y][player.x];

    var errorMessage = "Can't move in the requested direction";
    
    if (gameState.mapData[player.y + y] != null && gameState.mapData[player.y + y][player.x + x] != null) {
        var proposedCell = gameState.mapData[player.y + y][player.x + x];
        
        // Find handler for target destination based on it's displayed symbol
        var action = possibleDestinations[proposedCell.s()];
        if (action != null) {
            console.log("Processing action");
            action(currentCell, proposedCell);
            errorMessage = "";
        }
    }

    // Update/clear the error message
    d3.select("#error").text(errorMessage);
}

var possibleDestinations = {
    ".": moveToEmptySpace,
};

// Simplest action function - just move the player to the new cell
function moveToEmptySpace(currentCell, proposedCell) {
    currentCell.p = false;
    proposedCell.p = true;
    gameState.player.x = proposedCell.x;
    gameState.player.y = proposedCell.y;
}

// Create symbol to css class map
function initClassMap() {
    var gfx = gameState.gfx;
    gfx.colors = {
        "@": "player",
        "#": "wall",
        ".": "floor"
    };
}