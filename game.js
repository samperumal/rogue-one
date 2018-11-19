var gameState = {};

function initialise() {
    gameState = {
        gfx: {
            cellSize: 25,        
        }
    };

    initClassMap();
    gameState.gfx.svg = d3.select("#gfx");
    gameState.gfx.floor = gameState.gfx.svg.append("g").attr("class", "floor");

    loadMap()
        .then(draw)
        .then(update)
        .then(function() {
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

function initClassMap() {
    var gfx = gameState.gfx;
    gfx.colors = {
        "@": "player",
        "#": "wall",
        ".": "floor"
    };
}