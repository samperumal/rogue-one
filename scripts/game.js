import { loadMap, baseArmour, bucketHelm, weapon, key } from "./map.js";
import { lineOfSightTest } from "./visibility.js";
import { InputStateMachine, Rule } from "./input.js";

document.addEventListener("DOMContentLoaded", function () {
    initialise(loadMap("./map"));
});

export var gameState = {};
var inputState = new InputStateMachine([
    new Rule(key => {
        switch (key) {
            case "KeyW":
            case "ArrowUp": return [0, -1];
            case "KeyS":
            case "ArrowDown": return [0, 1];
            case "KeyA":
            case "ArrowLeft": return [-1, 0];
            case "KeyD":
            case "ArrowRight": return [1, 0];
            default: return false;
        }
    },
        [],
        coord => requestMove(...coord)
    ),
    // TODO(antonburger): Remove; testing guff to demo a multi-key sequence with context
    new Rule("KeyQ", [
        new Rule(key => {
            switch (key) {
                case "Digit1": return 1;
                case "Digit2": return 2;
                case "Digit3": return 3;
                default: return false;
            }
        },
            [],
            context => console.log("Quaffed potion " + context))
    ])
]);

// Called on game startup
export function initialise(mapPromise) {
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
            equippedItems: {
                weapon: null,
                armour: null
            },
            health: 5,
            baseStats: {
                armour: 0,
                damage: 1,
                visualRange: 10
            },
            stats: {}
        },
        // Map data
        mapData: null,
        // Convenience copy of above for display
        mapArray: null,
        settings: {
            checkLOS: true,
            displayLOS: true,
            visualRange: 10
        }
    };

    // Capture display elements drawing/update operations
    gameState.gfx.svg = d3.select("#gfx");
    gameState.gfx.content = gameState.gfx.svg.append("g").attr("class", "content");
    gameState.gfx.floor = gameState.gfx.content.append("g").attr("class", "floor");
    gameState.gfx.gold = d3.select("#gold");
    gameState.gfx.health = d3.select("#health");
    gameState.gfx.armour = d3.select("#armourlevel");
    gameState.gfx.damage = d3.select("#weaponLevel");

    gameState.gfx.svg
        .attr("viewBox", "0 0 " + (gameState.gfx.width) + " " + (gameState.gfx.height));

    gameState.gfx.content
        .attr("transform", "translate(" + (gameState.gfx.width / 2) + "," + (gameState.gfx.height / 2) + ")");

    // Call promise chain to load and draw map from file
    return mapPromise
        .then(map => {
            gameState = { ...gameState, ...map };
            const playerStart = map.mapArray.find(cell => cell.p);
            gameState.player.x = playerStart.x;
            gameState.player.y = playerStart.y;
        })
        .then(draw)
        .then(update)
        .then(function () {
            // Attach general key listener
            d3.select('body')
                .on("keydown", _=>processInput(d3.event.code))
                .node()
                .focus();

            // Attach EnableLOS listener
            d3.select("#enableLOS")
                .on("change", function (d) {
                    gameState.settings.checkLOS = d3.select(this).property("checked");
                    update();
                });

            d3.select("#visualRange")
                .on("change", function (d) {
                    gameState.settings.visualRange = d3.select(this).property("value");
                    update();
                });

            // Attach DisplayLOS listener
            d3.select("#displayLOS")
                .on("change", function (d) {
                    gameState.settings.displayLOS = d3.select(this).property("checked");
                    update();
                });

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
    var gfx = gameState.gfx;

    // Update player stats
    Object.assign(gameState.player.stats, gameState.player.baseStats);
    for (const key in gameState.player.equippedItems) {
        const item = gameState.player.equippedItems[key];
        if (item && item.applyEffect)
            item.applyEffect(gameState.player.stats);
    }

    // Update cell css class and text symbol
    gfx.floor.selectAll("g.cell text")
        .attr("class", d => d.css())
        .text(d => d.s());

    if (gameState.settings.checkLOS) {
        updateLOS();
    }

    if (gameState.settings.displayLOS) {
        gameState.gfx.floor.selectAll("g.cell text")
            .classed("hidden", d => !d.isVisible)
            .classed("hasBeenSeen", d => d.hasBeenSeen);
    }

    gfx.gold.text(gameState.player.gold);
    gfx.health.text(gameState.player.health);
    gfx.armour.text(gameState.player.stats.armour);
    gfx.damage.text(gameState.player.stats.damage);

    gfx.floor.attr("transform", "translate(" + (-gameState.player.x * gfx.cellSize) + "," + (-gameState.player.y * gfx.cellSize) + ")");
}

const stepDistanceBetween = (sourcePoint, destinationPoint) => Math.abs(destinationPoint.x - sourcePoint.x) + Math.abs(destinationPoint.y - sourcePoint.y);

function updateLOS() {
    // Perform LOS checks and updates
    if (gameState.settings.checkLOS) {
        // Clear stale state
        gameState.mapArray.forEach(v => v.isVisible = false);

        // We only need to consider objects within the visual range
        const objectsInRange = gameState.mapArray.filter(v => stepDistanceBetween(gameState.player, v) <= gameState.player.stats.visualRange);

        // isVisible means there is line of sight to the player
        const isVisible = lineOfSightTest(objectsInRange)(gameState.player)

        // Check whether each cell is currently visible
        // Record change in visibility if never previously seen
        objectsInRange.forEach(v => {
            v.isVisible = isVisible(v);
            if (!v.hasBeenSeen && v.isVisible)
                v.hasBeenSeen = true;
        });

        if (gameState.settings.displayLOS) {
            // Update
            gameState.gfx.floor.selectAll("g.cell text")
                .classed("hidden", d => !d.isVisible)
                .classed("hasBeenSeen", d => d.hasBeenSeen);
        }

    }
}

// Process key input
export function processInput(key) {
    // Escape cancels any in-progress sequence.
    if (key === "Escape") {
        inputState.reset();
    } else if (inputState.evaluate(key)) {
        // Redraw map
        update();
    }

    // TODO(antonburger): Remove testing guff
    if (inputState.current.keySequence.length) {
        console.log("Pressed " + inputState.current.keySequence.join() + " so far; waiting for more input.");
    }
}

// Attempt to move to new cell
function requestMove(x, y) {
    var player = gameState.player;
    var currentCell = gameState.mapData[player.y][player.x];

    if (player.health <= 0)     // Player has died
        return;

    var errorMessage = "";//"Can't move in the requested direction";

    if (gameState.mapData[player.y + y] != null && gameState.mapData[player.y + y][player.x + x] != null) {
        var proposedCell = gameState.mapData[player.y + y][player.x + x];

        // Find handler for target destination based on it's displayed symbol
        var action = possibleDestinations[proposedCell.s()];
        if (action != null) {
            action(currentCell, proposedCell);
            errorMessage = "";
        }
    }

    // Update/clear the error message
    if (errorMessage != "")
        error(errorMessage);
}

function error(msg) {
    d3.select("#log").insert("div", ":first-child").attr("class", "error").text(msg);
}

function info(msg) {
    d3.select("#log").insert("div", ":first-child").attr("class", "info").text(msg);
}

function update_inventory(item) {
    gameState.player.items.push(item);
    d3.select("#inventory").append("div", ":last-child").attr("class", "info").text(item);
    info("You picked up a " + item);
}

var possibleDestinations = {
    "#": moveToWall,
    ".": moveToSpace,
    "+": moveThroughDoor,
    "*": pickupGold,
    "¬": pickupItem,
    "/": pickupItem,
    "▾": pickupItem,
    "õ": pickupItem,
    "☻": hitMonster
};

function moveToWall(_, proposedCell) {
    if (proposedCell.isVisible || proposedCell.hasBeenSeen)
        return error("Can't move in the requested direction");

    info("You bump into something in the darkness");
    proposedCell.hasBeenSeen = true;
}

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
    if (proposedCell.i != null && proposedCell.i.quantity > 0) {
        gameState.player.gold += proposedCell.i.quantity;

        var msg = d3.select("#log").insert("div", ":first-child").attr("class", "info");
        msg.append("span").text("You picked up ");
        msg.append("span").attr("class", "gold").text(proposedCell.i.quantity);
        msg.append("span").text(" gold");
        proposedCell.i = null;
    }
}

function hitMonster(currentCell, proposedCell) {
    const monsterHealth = proposedCell.i.health;
    if (proposedCell.i.isDead())
        return moveToSpace(currentCell, proposedCell);

    //  Monster is definitely still alive...
    proposedCell.i.takeDamage(gameState.player.stats.damage);

    info("You hit the monster, doing " + (monsterHealth - proposedCell.i.health) + " damage.  " +
        "(" + proposedCell.i.tt() + ": " + proposedCell.i.health + " remaining)");

    if (proposedCell.i.isDead()) {
        info("You slay the monster!");
    }
    else {
        if (proposedCell.i.damage > 0) {
            const effectiveDamage = Math.max(0, proposedCell.i.damage - gameState.player.stats.armour);
            info("Monster hits you back, doing " + effectiveDamage+ " damage!");
            gameState.player.health -= effectiveDamage;

            if (gameState.player.health <= 0) {
                error("YOU DIED!");
            }
        }
    }
}

function pickupItem(currentCell, proposedCell) {
    moveToSpace(currentCell, proposedCell);
    var newItem = proposedCell.i;

    if (!gameState.player.items.includes(newItem.tt())) {
        update_inventory(newItem.tt());
        proposedCell.i = null;

        switch (newItem.t()) {
            case "/": // weapon;
                equipWeapon(newItem);
                break;
            case "▾": // armour
                equipArmour(newItem);
                break;
        }
    }
    else {
        info("You already have a " + newItem.tt());
    }
}

function equipArmour(newArmour) {
    var oldArmour = gameState.player.equippedItems.armour;
    //if (oldArmour == null || newArmour.armour > oldArmour.armour) {
        gameState.player.equippedItems.armour = newArmour;
        info("You have equipped the " + newArmour.name);
    //}
}

function equipWeapon(newWeapon) {
    var oldWeapon = gameState.player.equippedItems.weapon;
    if (oldWeapon == null || newWeapon.damage > oldWeapon.damage) {
        gameState.player.equippedItems.weapon = newWeapon;
        info("You have equipped the " + newWeapon.name);
    }
}


export const tileAt = (x,y)=> gameState.mapData[y][x];