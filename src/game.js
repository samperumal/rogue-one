// To just import everything from all of d3, use this:
// import * as d3 from "d3";
import { select as d3_select, event as d3_event } from "d3-selection";
import {loadMap} from "./map.js";

document.addEventListener("DOMContentLoaded", function () {
    initialise();
});

var gameState = {};

// Called on game startup
function initialise() {
    // Setup global game state
    gameState = {
        // Display state
        gfx: {
            cellSize: 25,
            width: 1200,
            height: 450
        },
        // Player state
        player: {
            x: 0,
            y: 0,
            gold: 0,
            items: [],
            health: 5,
        },
        // Map data
        mapData: null,
        // Convenience copy of above for display
        mapArray: null,
    };

    // Capture display elements drawing/update operations
    gameState.gfx.svg = d3_select("#gfx");
    gameState.gfx.content = gameState.gfx.svg.append("g").attr("class", "content");
    gameState.gfx.floor = gameState.gfx.content.append("g").attr("class", "floor");
    gameState.gfx.gold = d3_select("#gold");

    gameState.gfx.svg
        .attr("viewBox", "0 0 " + (gameState.gfx.width) + " " + (gameState.gfx.height));

    gameState.gfx.content
        .attr("transform", "translate(" + (gameState.gfx.width / 2) + "," + (gameState.gfx.height / 2) + ")");

    // Call promise chain to load and draw map from file
    loadMap()
        .then(map => {
            gameState = {...gameState, ...map};
            const playerStart = map.mapArray.find(cell => cell.p);
            gameState.player.x = playerStart.x;
            gameState.player.y = playerStart.y;
        })
        .then(draw)
        .then(update)
        .then(function () {
            d3_select('body')
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
        .attr("class", d => d.css())
        .text(d => d.s());

    gfx.gold.text(gameState.player.gold);

    gfx.floor.attr("transform", "translate(" + (-gameState.player.x * gfx.cellSize) + "," + (-gameState.player.y * gfx.cellSize) + ")");
}

// Process key input
function processInput(d) {
    switch (d3_event.code) {
        case "KeyW": 
        case "ArrowUp":
            requestMove(0, -1); 
            break;
        case "KeyS":
        case "ArrowDown": 
            requestMove(0, 1); 
            break;
        case "KeyA":
        case "ArrowLeft": 
            requestMove(-1, 0); 
            break;
        case "KeyD":
        case "ArrowRight": 
            requestMove(1, 0); 
            break;
        default: return;
    }

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
    if (errorMessage != "")
        error(errorMessage);
}

function error(msg) {
    d3_select("#log").insert("div", ":first-child").attr("class", "error").text(msg);
}

function info(msg) {
    d3_select("#log").insert("div", ":first-child").attr("class", "info").text(msg);
}

var possibleDestinations = {
    ".": moveToSpace,
    "+": moveThroughDoor,
    "*": pickupGold,
    "¬": pickupKey
};

// Simplest action function - just move the player to the new cell
function moveToSpace(currentCell, proposedCell) {
    currentCell.p = false;
    proposedCell.p = true;
    gameState.player.x = proposedCell.x;
    gameState.player.y = proposedCell.y;
}

function moveThroughDoor(currentCell, proposedCell) {
    var door = proposedCell.i;
    if (!door.open) {
        if (gameState.player.items.includes(door.colour + " key")) {
            door.open = true; 
            info("You opened a " + door.colour + " door.");
        }
        else {
            error("You need a " + door.colour + " key.");
        }
    }
    else moveToSpace(currentCell, proposedCell);
}

function pickupGold(currentCell, proposedCell) {
    moveToSpace(currentCell, proposedCell);
    proposedCell.i = null;
    gameState.player.gold += 1;
    info("You picked up gold.");
}

function pickupKey(currentCell, proposedCell) {
    moveToSpace(currentCell, proposedCell);
    var newKey = proposedCell.i;

    if (!gameState.player.items.includes(newKey.tt())) {
        gameState.player.items.push(newKey.tt());
        info("You picked up a " + newKey.tt());
        proposedCell.i = null;
    }
    else {
        info("You already have a " + newKey.tt());
    }
}
