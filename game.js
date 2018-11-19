var gameState = {};

function initialise() {
    gameState = {
        gfx: {
            cellSize: 25,
        },
        player: {
            x: 0,
            y: 0
        }
    };

    initClassMap();
    gameState.gfx.svg = d3.select("#gfx");
    gameState.gfx.floor = gameState.gfx.svg.append("g").attr("class", "floor");

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

function draw() {
    console.log("Drawing map");

    var gfx = gameState.gfx;

    var allCells = gfx.floor.selectAll("g.cell")
        .data(gameState.mapArray, d => d.i);

    allCells.enter()
        .append("g").attr("class", "cell")
        .attr("transform", d => "translate(" + (d.x * gfx.cellSize) + "," + (d.y * gfx.cellSize) + ")")
        .append("text")
        .attr("transform", d => "translate(" + (gfx.cellSize / 2) + "," + (gfx.cellSize / 2) + ")");

    allCells.exit().remove();
}

function update() {
    console.log("Updating map");
    var gfx = gameState.gfx;

    gfx.floor.selectAll("g.cell text")
        .attr("class", d => gfx.colors[d.s()])
        .text(d => d.s());
}

function processInput(d) {
    switch (d3.event.code) {
        case "KeyW": requestMove(0, -1); break;
        case "KeyS": requestMove(0, 1); break;
        case "KeyA": requestMove(-1, 0); break;
        case "KeyD": requestMove(1, 0); break;
        default: return;
    }

    d3.select("#in").property("value", "");

    update();
}

function requestMove(x, y) {
    var player = gameState.player;
    var currentCell = gameState.mapData[player.y][player.x];

    var errorMessage = "Can't move in the requested direction";
    
    if (gameState.mapData[player.y + y] != null && gameState.mapData[player.y + y][player.x + x] != null) {
        var proposedCell = gameState.mapData[player.y + y][player.x + x];
        
        var action = possibleDestinations[proposedCell.s()];
        if (action != null) {
            console.log("Processing action");
            action(currentCell, proposedCell);
            errorMessage = "";
        }
    }

    d3.select("#error").text(errorMessage);
}

var possibleDestinations = {
    ".": moveToEmptySpace,
};

function moveToEmptySpace(currentCell, proposedCell) {
    currentCell.p = false;
    proposedCell.p = true;
    gameState.player.x = proposedCell.x;
    gameState.player.y = proposedCell.y;
}

function initClassMap() {
    var gfx = gameState.gfx;
    gfx.colors = {
        "@": "player",
        "#": "wall",
        ".": "floor"
    };
}