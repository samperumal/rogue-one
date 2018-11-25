// To just import everything from all of d3, use this:
//import * as d3 from "d3";
import { loadMap, armour, weapon, key } from "./map";
import { lineOfSightTest } from "./visibility.js";
import { InputStateMachine, Rule } from "./input.js";
declare const d3: any;

document.addEventListener("DOMContentLoaded", function () {
    var game = new Game();
    game.initialise(loadMap("./map"));
});

function error(msg) {
    d3.select("#log").insert("div", ":first-child").attr("class", "error").text(msg);
}

function info(msg) {
    d3.select("#log").insert("div", ":first-child").attr("class", "info").text(msg);
}

export class Game {
    gameState:any = {};
    inputState = new InputStateMachine([
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
            coord => this.requestMove(coord[0],coord[1])
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
        ],undefined)
    ]);

    // Called on game startup
    initialise(mapPromise) {
        // Setup global game state
        this.gameState = {
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
        this.gameState.gfx.svg = d3.select("#gfx");
        this.gameState.gfx.content = this.gameState.gfx.svg.append("g").attr("class", "content");
        this.gameState.gfx.floor = this.gameState.gfx.content.append("g").attr("class", "floor");
        this.gameState.gfx.gold = d3.select("#gold");
        this.gameState.gfx.health = d3.select("#health");
        this.gameState.gfx.armour = d3.select("#armourlevel");
        this.gameState.gfx.damage = d3.select("#weaponLevel");

        this.gameState.gfx.svg
            .attr("viewBox", "0 0 " + (this.gameState.gfx.width) + " " + (this.gameState.gfx.height));

        this.gameState.gfx.content
            .attr("transform", "translate(" + (this.gameState.gfx.width / 2) + "," + (this.gameState.gfx.height / 2) + ")");

        const self = this;
        // Call promise chain to load and draw map from file
        return mapPromise
            .then(map => {
                this.gameState = { ...this.gameState, ...map };
                const playerStart = map.mapArray.find(cell => cell.p);
                this.gameState.player.x = playerStart.x;
                this.gameState.player.y = playerStart.y;
            })
            .then(()=>this.draw())
            .then(()=>this.update())
            .then(function () {
                // Attach general key listener
                d3.select('body')
                    .on("keydown", v=>self.processInput(d3.event.code))
                    .node()
                    .focus();

                // Attach EnableLOS listener
                d3.select("#enableLOS")
                    .on("change", function (d) {
                        self.gameState.settings.checkLOS = d3.select(this).property("checked");
                        self.update();
                    });

                d3.select("#visualRange")
                    .on("change", function (d) {
                        self.gameState.settings.visualRange = d3.select(this).property("value");
                        self.update();
                    });

                // Attach DisplayLOS listener
                d3.select("#displayLOS")
                    .on("change", function (d) {
                        self.gameState.settings.displayLOS = d3.select(this).property("checked");
                        self.update();
                    });

                console.log("Loaded");
            })
            .then(_=>this.gameState);
    }

    // Draw map when first loaded
    draw() {
        console.log("Drawing map");

        var gfx = this.gameState.gfx;

        // Bind cell data to SVG groups
        var allCells = gfx.floor.selectAll("g.cell")
            .data(this.gameState.mapArray, d => d.i);

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
    update() {
        var gfx = this.gameState.gfx;

        // Update player stats
        Object.assign(this.gameState.player.stats, this.gameState.player.baseStats);
        for (const key in this.gameState.player.equippedItems) {
            const item = this.gameState.player.equippedItems[key];
            if (item && item.applyEffect)
                item.applyEffect(this.gameState.player.stats);
        }

        // Update cell css class and text symbol
        gfx.floor.selectAll("g.cell text")
            .attr("class", d => d.css())
            .text(d => d.s());

        if (this.gameState.settings.checkLOS) {
            this.updateLOS();
        }

        if (this.gameState.settings.displayLOS) {
            this.gameState.gfx.floor.selectAll("g.cell text")
                .classed("hidden", d => !d.isVisible)
                .classed("hasBeenSeen", d => d.hasBeenSeen);
        }

        gfx.gold.text(this.gameState.player.gold);
        gfx.health.text(this.gameState.player.health);
        gfx.armour.text(this.gameState.player.stats.armour);
        gfx.damage.text(this.gameState.player.stats.damage);

        gfx.floor.attr("transform", "translate(" + (-this.gameState.player.x * gfx.cellSize) + "," + (-this.gameState.player.y * gfx.cellSize) + ")");
    }

    stepDistanceBetween = (sourcePoint, destinationPoint) => Math.abs(destinationPoint.x - sourcePoint.x) + Math.abs(destinationPoint.y - sourcePoint.y);

    updateLOS() {
        // Perform LOS checks and updates
        if (this.gameState.settings.checkLOS) {
            // Clear stale state
            this.gameState.mapArray.forEach(v => v.isVisible = false);

            // We only need to consider objects within the visual range
            const objectsInRange = this.gameState.mapArray.filter(v => this.stepDistanceBetween(this.gameState.player, v) <= this.gameState.player.stats.visualRange);

            // isVisible means there is line of sight to the player
            const isVisible = lineOfSightTest(objectsInRange)(this.gameState.player)

            // Check whether each cell is currently visible
            // Record change in visibility if never previously seen
            objectsInRange.forEach(v => {
                v.isVisible = isVisible(v);
                if (!v.hasBeenSeen && v.isVisible)
                    v.hasBeenSeen = true;
            });

            if (this.gameState.settings.displayLOS) {
                // Update
                this.gameState.gfx.floor.selectAll("g.cell text")
                    .classed("hidden", d => !d.isVisible)
                    .classed("hasBeenSeen", d => d.hasBeenSeen);
            }
        }
    }

    // Process key input
    processInput(key) {
        // Escape cancels any in-progress sequence.
        if (key === "Escape") {
            this.inputState.reset();
        } else if (this.inputState.evaluate(key)) {
            // Redraw map
            this.update();
        }

        // TODO(antonburger): Remove testing guff
        if (this.inputState.current.keySequence.length) {
            console.log("Pressed " + this.inputState.current.keySequence.join() + " so far; waiting for more input.");
        }
    }

    // Attempt to move to new cell
    requestMove(x, y) {
        var player = this.gameState.player;
        var currentCell = this.gameState.mapData[player.y][player.x];

        if (player.health <= 0)     // Player has died
            return;

        var errorMessage = "";//"Can't move in the requested direction";
       if (this.gameState.mapData[player.y + y] != null && this.gameState.mapData[player.y + y][player.x + x] != null) {
            var proposedCell = this.gameState.mapData[player.y + y][player.x + x];

            // Find handler for target destination based on it's displayed symbol
            var action = this.possibleDestinations[proposedCell.s()];
            if (action != null) {
                action(currentCell, proposedCell);
                errorMessage = "";
            }
        }

        // Update/clear the error message
        if (errorMessage != "")
            error(errorMessage);
    }


    update_inventory(item) {
        this.gameState.player.items.push(item);
        //d3.select("#inventory").append("div", ":last-child").attr("class", "info").text(item);
        info("You picked up a " + item);
    }
    possibleDestinations = {
        "#": (a,b)=>this.moveToWall(a,b),
        ".": (a,b)=>this.moveToSpace(a,b),
        "+": (a,b)=>this.moveThroughDoor(a,b),
        "*": (a,b)=>this.pickupGold(a,b),
        "¬": (a,b)=>this.pickupItem(a,b),
        "/": (a,b)=>this.pickupItem(a,b),
        "▾": (a,b)=>this.pickupItem(a,b),
        "õ": (a,b)=>this.pickupItem(a,b),
        "☻": (a,b)=>this.hitMonster(a,b)
    };


    moveToWall(_, proposedCell) {
        if (proposedCell.isVisible || proposedCell.hasBeenSeen)
            return error("Can't move in the requested direction");

        info("You bump into something in the darkness");
        proposedCell.hasBeenSeen = true;
    }

    // Simplest action function - just move the player to the new cell
    moveToSpace(currentCell, proposedCell) {
        currentCell.p = false;
        proposedCell.p = true;
        this.gameState.player.x = proposedCell.x;
        this.gameState.player.y = proposedCell.y;
    }

    moveThroughDoor(currentCell, proposedCell) {
        var door = proposedCell.i;
        if (!door.open) {
            if (this.gameState.player.items.includes(door.colour + " key")) {
                door.open = true;
                info("You opened a " + door.colour + " door.");
            }
            else {
                error("You need a " + door.colour + " key.");
            }
        }
        else this.moveToSpace(currentCell, proposedCell);
    }

    pickupGold(currentCell, proposedCell) {
        this.moveToSpace(currentCell, proposedCell);
        if (proposedCell.i != null && proposedCell.i.quantity > 0) {
            this.gameState.player.gold += proposedCell.i.quantity;

            var msg = d3.select("#log").insert("div", ":first-child").attr("class", "info");
            msg.append("span").text("You picked up ");
            msg.append("span").attr("class", "gold").text(proposedCell.i.quantity);
            msg.append("span").text(" gold");
            proposedCell.i = null;
        }
    }

    hitMonster(currentCell, proposedCell) {
        const monsterHealth = proposedCell.i.health;
        if (proposedCell.i.isDead())
            return this.moveToSpace(currentCell, proposedCell);

        //  Monster is definitely still alive...
        proposedCell.i.takeDamage(this.gameState.player.stats.damage);

        info("You hit the monster, doing " + (monsterHealth - proposedCell.i.health) + " damage.  " +
            "(" + proposedCell.i.tt() + ": " + proposedCell.i.health + " remaining)");

        if (proposedCell.i.isDead()) {
            info("You slay the monster!");
        }
        else {
            if (proposedCell.i.damage > 0) {
                const effectiveDamage = Math.max(0, proposedCell.i.damage - this.gameState.player.stats.armour);
                info("Monster hits you back, doing " + effectiveDamage+ " damage!");
                this.gameState.player.health -= effectiveDamage;

                if (this.gameState.player.health <= 0) {
                    error("YOU DIED!");
                }
            }
        }
    }

    pickupItem(currentCell, proposedCell) {
        this.moveToSpace(currentCell, proposedCell);
        var newItem = proposedCell.i;

        if (!this.gameState.player.items.includes(newItem.tt())) {
            this.update_inventory(newItem.tt());
            proposedCell.i = null;

            switch (newItem.t()) {
                case "/": // weapon;
                    this.equipWeapon(newItem);
                    break;
                case "▾": // armour
                    this.equipArmour(newItem);
                    break;
            }
        }
        else {
            info("You already have a " + newItem.tt());
        }
    }

    equipArmour(newArmour) {
        var oldArmour = this.gameState.player.equippedItems.armour;
        if (oldArmour == null || newArmour.armour > oldArmour.armour) {
            this.gameState.player.equippedItems.armour = newArmour;
            info("You have equipped the " + newArmour.name);
        }
    }

    equipWeapon(newWeapon) {
        var oldWeapon = this.gameState.player.equippedItems.weapon;
        if (oldWeapon == null || newWeapon.damage > oldWeapon.damage) {
            this.gameState.player.equippedItems.weapon = newWeapon;
            info("You have equipped the " + newWeapon.name);
        }
    }
}