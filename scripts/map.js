import {addArmour, addDamage,setVisualRange, healPlayer, info} from "./game.js";
import * as Modifiers from "./modifiers.js";

export async function loadMap(url) {
    const downloads = [d3.text(url + ".txt"), d3.json(url + ".json")];
    const [mapText, mapJson] = await Promise.all(downloads);
    return parseMap(mapText, mapJson);
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.t = null; // Cell tile symbol
        this.tt = null; // Cell tile type
        this.p = false; // Player in cell
        this.i = null; // Item in cell
        this.isVisible = false;
        this.hasBeenSeen = false;
    }

    // Display symbol
    s() {
        if (this.p) return "@";
        else if (this.i != null) return this.i.t();
        else return this.t;
    }

    css() {
        if (this.p) return "player";
        else if (this.i != null) {
            if (this.i.tt == null) {
                // Debugging code to show errors on map
                console.log(this);
                return "X";
            } else return this.i.tt();
        } else return this.tt;
    }
}

class monster {
    constructor() {
        this.colour = "white";
        this.health = 1;
        this.armour = 0;
        this.damage = 0;
    }

    t() {
        return "☻";
    }
    tt() {
        return this.colour + " blob";
    }

    effectiveDamage(d){
        var unblockedDamage = Math.max(1, d - this.armour); // Minimum damage of 1
        return Math.min(d, this.health); // can't damage more than available health
    }

    takeDamage(d) {
        this.health-=this.effectiveDamage(d);
        if (this.health <= 0) {
            this.colour = "dead";
        }
    }

    isDead() {
        return this.health <= 0;
    }
}

class door {
    constructor() {
        this.open = false;
        this.colour = "white";
    }
    t() {
        return "+";
    }
    tt() {
        return this.colour + " door " + (this.open ? "open" : "closed");
    }
}

class gold {
    constructor() {
        this.quantity = 1;
    }
    t() {
        return "*";
    }
    tt() {
        return "gold";
    }
}

class key {
    constructor() {
        this.colour = "white";
    }
    t() {
        return "¬";
    }
    tt() {
        return this.colour + " key";
    }
}

class potion {
    constructor() {
        this.colour = "white";
    }
    t() {
        return "õ";
    }
    tt() {
        return this.colour + " potion";
    }
}

class weapon {
    constructor() {
        this.name = "unidentified";
    }
    t() {
        return "/";
    }
    tt() {
        return "weapon (" + this.name + ")";
    }
}

class baseArmour {
    constructor() {
        this.type = "base_armor";
        this.name = "unidentified";
    }

    t() {
        return "▾";
    }
    tt() {
        return "armour (" + this.name + ")";
    }
}


// Paper Armor: armor the gets weaker each time you are hit
// Example of the benefits of storing state in the item
/*
class paperArmour {
//    armor= 10;
    applyEffect(event) {
        switch (event.type) {
        case "turnStart": return addArmour(this.armour);
        case "monsterHitsPlayer":  this.armor-=1;
        default: return;
        }
    }
}
*/

// Varpire Cloak : Applies life steal when the player damages a monster
// and example of a hand-written unique item who's effects will not be 
// generated randomly
class vampireCloak {
    constructor() {
        this.type = "vampire_cloak";
        this.name = "Cloak of the Vampire";
        this.armour = 0;
        this.modifiers = [
            {
                name: "Life Steal",
        // apply the effects that occur while this item is equipped
            apply(event) {
            switch (event.type) {
            case "playerDamagesMonster":  // When the player damages a monster
                info("You suck "+event.damage+" health from the monster"); 
                healPlayer(event.damage); // Heal the player
            break;
            case "playerQuaffsPotion":
                if (event.potion.flavour=="garlic") {
                    info("It Burns!");
                    damagePlayer(10)
                }
            break;
            case "monsterHitsPlayer":
                if (event.monster.weapon.material=="silver")
                {
                    info("Isn't this for werewolves?");
                    damagePlayer(10);
                }
            break
            case "playerVictory":
                info("You climb unsteadily from the dungon,");
                info("Death Star Plans clutched victoriously in your hands");
                info("The morning sun rises, above the distant hills");
                info("and burns you to ash");
                killPlayer();
            break;
            default: return;
        }
        }
    }];
    }

        t() {
            return "▾";
        }
        tt() {
            return "armour (" + this.name + ")";
        }
}

const constructAndAssign = c => data => { 
    var item = Object.assign(new (c)(),data);
    if (data.modifiers)
    {
        item.modifiers=[];
        for (var name in data.modifiers )
        {
            item.modifiers.push(Modifiers.modifierFactory(name, data.modifiers[name], item));
        }
    }
    return item;
}

// Known tile types
const TILES = {
    " ": { tt: "rock" },
    "": { tt: "rock" },
    "#": { tt: "wall" },
    ".": { tt: "floor" },
    "*": { tt: "gold", factory: constructAndAssign(gold) },
    "¬": { tt: "key", factory: constructAndAssign(key) },
    õ: { tt: "potion", factory: constructAndAssign(potion) },
    "▾": {
        tt: "armour",
        factory: (/** @type {baseArmour | bucketHelm} */ v) => {
            switch (v.type) {
                case "vampire_cloak":
                    return constructAndAssign(vampireCloak)(v);
                default:
                    return constructAndAssign(baseArmour)(v);
            }
        }
    },
    "/": { tt: "weapon", factory: constructAndAssign(weapon) },
    "+": { tt: "door", factory: constructAndAssign(door) },
    "☻": { tt: "monster", factory: constructAndAssign(monster) }
};

function parseMap(d, itemDefinitions) {
    console.log("Parsing");

    // Convert input text into array of arrays of characters (length 1 strings)
    var mapText = d3
        .dsvFormat("")
        .parseRows(d)
        .map(d => d[0].split("").map(d => (d == " " ? "" : d)));

    var y = 0;

    // Convert strings into cell description objects
    const mapData = mapText.map(function(a) {
        var x = 0;
        var row = a.map(c => parseCell(c, itemDefinitions, x++, y));
        y++;

        return row;
    });

    // Flatten map for rendering
    const mapArray = mapData.reduce((a, b) => a.concat(b), []);

    return { mapData, mapArray };

    // Turn each character into a cell, based on the symbol and accompanying
    // definition in the json file.
    function parseCell(c, itemDefinitions, x, y) {
        const cell = new Cell(x, y);
        var itemDefinition = null

        // Override tile symbol for parsing if player
        if (c == "@") {
            cell.p = true;
            c = ".";
        }

        // Attempt to find this cell in item definition metadata
        else if (itemDefinitions != null && itemDefinitions[c] != null) {
            for (const item of itemDefinitions[c]) {
                if (item.x == cell.x && item.y == cell.y) {
                    itemDefinition= item;
                    cell.i = item;
                }
            }
            if (itemDefinition.type=="base_armour")
                debugger;

            if (itemDefinition == null) {
                console.log("No definition found: ", cell, c);
                // Create default if none exists
                cell.i = {};
            }
            else
            {
                if (TILES[c] && TILES[c].factory)
                cell.i = TILES[c].factory(itemDefinition);

            }

            // Override tile symbol for parsing if known
            c = ".";
        }

        // Assign symbol and tile type
        cell.t = c;
        cell.tt = TILES[c].tt;

        return cell;
    }
}
