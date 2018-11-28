import "./map.js";
import { gfx } from "./gfx.js";

document.addEventListener("DOMContentLoaded", function () {
    run();
});

const Tplayer = "player";
const Tblocked = "blocked";
const Tlock = "lock";
const Tkey = "key";
const Tpickup = "pickup";

class cgame {
    constructor() {
        this.gfx = new gfx;
        this.player = {
            symbol: "@",
            name: "player",
            space: null,
            tags: [Tplayer],
            inventory: []
        };

        this.mapData = [];
        this.mapArray = [];

        this.actions = {
            "player": {
                "spawn": [spawn],
                "move": [attack, pickup, unlock, move],
            }
        };
    }

    initialise() {
        [this.mapData, this.mapArray] = loadMap();
        this.gfx.draw(this.mapArray);
        this.update();
    }

    update() {
        this.gfx.update(this.player);
    }

    act(actor, action, source, target, start, end) {
        // Get list of possible actions
        const actionList = this.actions[actor][action];

        // Run through list of actions, until one returns true and breaks the chain
        for (const action of actionList)
            if (action(source, target, start, end))
                break;

        this.update();
    }
}

const function_lookup = {
    "key_master": key_master,
}

function key_master(key, lock) {
    if (lock.tags != null && lock.tags.includes(Tblocked))
        lock.tags.splice(lock.tags.indexOf(Tblocked), 1);
}

function spawn(player, target, start, end) {
    if (start != null) {
        console.error(start);
        throw "Player already exists in the world!";
    }
    else if (end.entities.length > 0) {
        console.error(end);
        throw "Unable to spawn, space not empty!";
    }
    else {
        player.space = end;
        end.entities.push(player);
        return true;
    }
}

function attack(source, target, start, end) {

}

function unlock(source, target, start, end) {
    // Try unlocking structures first
    if (end.structure.tags.includes(Tlock) && end.structure.tags.includes(Tblocked)) {
        for (const key of source.inventory.filter(d => d.tags.includes(Tkey))) {
            console.log("Trying ", key);
            if (key.functions != null && key.functions["unlock"] != null) {
                function_lookup[key.functions["unlock"]](key, end.structure);
            }
        }
    }
}

function pickup(source, target, start, end) {
    if (start == null || end.items == null || end.items.length == 0)
        return;
    else if (!start.entities.includes(source)) {
        console.error(start);
        throw "Start does not contain source";
    }
    else if (source.inventory == null) {
        console.error(source);
        throw "Source does not have an inventory to pickup item";
    }
    else for (const item of end.items) {
        if (item.tags == null || !item.tags.includes(Tpickup)) {
            console.log("Not pickup-able", item);
        }
        else {
            source.inventory.push(item);
            end.items.splice(end.items.indexOf(item), 1);
            console.log("Picked up: ", item);
            // No return, do not stop chain processing
        }
    }

    return false;
}

function move(source, target, start, end) {
    if (!start.entities.includes(source)) {
        console.error(start);
        throw "Start does not contain source";
    }
    else if (end.entities.length > 0) {
        console.error(end);
        throw "End is not empty";
    }
    else if (end.structure.tags.includes(Tblocked)) {
        //console.error(end.structure);
        console.log("Blocked", end.structure);
        return false;
    }
    else if (target != null) {
        console.error(target);
        throw "This method does not accept a target";
    }
    else {
        start.entities.splice(start.entities.indexOf(source), 1);
        end.entities.push(source);
        source.space = end;

        return true;
    }

    return false;
}

var game = new cgame;

function run() {
    game.initialise();

    const testActions = [

        // Spawn player
        _ => game.act("player", "spawn", game.player, null, game.player.space, game.mapData[2][2]),

        // Move player onto floor
        _ => game.act("player", "move", game.player, null, game.player.space, game.mapData[1][2]),

        // Move player onto wall
        _ => game.act("player", "move", game.player, null, game.player.space, game.mapData[0][2]),

        // Move player onto locked door without key
        _ => game.act("player", "move", game.player, null, game.player.space, game.mapData[1][1]),

        // Move player onto key
        _ => game.act("player", "move", game.player, null, game.player.space, game.mapData[1][3]),

        // Move player onto locked door with key
        _ => game.act("player", "move", game.player, null, game.player.space, game.mapData[1][2]),
        _ => game.act("player", "move", game.player, null, game.player.space, game.mapData[1][1]),

        // Move player onto unlocked door

        // Move player onto sword A

        // Equip sword A

        // Mover player onto sword B

        // Attack adjacent monster

        // Equip sword B

        // Attack adjacent monster

        // Adjacent monster attacks player

        // Move player onto potion

        // Use potion, increase health

        // Move player onto Bow C

        // Equip Bow C

        // Fire bow at nothing (East)

        // Fire bow at monster out of range (West)

        // Move monster toward player (from West)

        // Fire bow at monster in range (West)
    ];

    function r(i) {
        if (i < testActions.length) {
            testActions[i]();
            game.update();

            setTimeout(_ => r(i + 1), 200);
        }
        else {
            console.log("Done!");
            logMap(game.mapData);
        }
    }

    r(0);

}

function space(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;

    this.structure = {
        symbol: null,
        name: null,
        tags: []
    };

    this.entities = [];

    this.items = [];
}

function structure(space, params) {
    Object.assign(space.structure, params);
}

function s_floor(space, params) {
    structure(space, {
        symbol: ".",
        name: "floor"
    });
}

function s_wall(space, params) {
    structure(space, {
        symbol: "#",
        name: "wall",
        tags: [Tblocked]
    });
}

function item(space, params) {
    space.items.push(params);
}

// ### Utility functions

function loadMap() {
    let mapData = [];
    for (let x = 0; x < 5; x++) {
        const col = [];
        for (let y = 0; y < 5; y++) {
            col.push(new space(x, y, 1));
        }
        mapData.push(col);
    }

    s_floor(mapData[2][2]);
    s_floor(mapData[1][2]);
    s_wall(mapData[0][2]);
    structure(mapData[1][1], {
        symbol: "+",
        name: "door",
        tags: [Tblocked, Tlock]
    });
    s_floor(mapData[1][3]);
    item(mapData[1][3], {
        name: "key",
        symbol: "¬",
        tags: [Tkey, Tpickup],
        functions: {
            "unlock": "key_master"
        }
    });

    let mapArray = mapData.reduce((a, b) => a.concat(b), []);

    return [mapData, mapArray];
}

function logMap(mapData) {
    for (const x of mapData) {
        for (const y of x)
            if (y.structure.symbol != null || y.entities.length > 0)
                console.log(y.x, y.y, y.structure, y.entities[0], y.entities, y.items);
    }

    console.log(mapData);
}
