export { loadMap, Cell, TILES, key, armour, weapon };
declare const d3: any;

async function loadMap(url) {
    const downloads = [d3.text(url + ".txt"), d3.json(url + ".json")];
    const [mapText, mapJson] = await Promise.all(downloads);
    return parseMap(mapText, mapJson);
}

class Cell {
    t = null; // Cell tile symbol
    tt = null; // Cell tile type
    p = false; // Player in cell
    i = null; // Item in cell
    isVisible = false;
    hasBeenSeen = false;

    constructor(public x, public y) {
    }

    // Display symbol
    s() {
        if (this.p)
            return "@";
        else if (this.i != null)
            return this.i.t();
        else
            return this.t;
    }

    css() {
        if (this.p) return "player";
        else if (this.i != null) {
            if (this.i.tt == null) {
                // Debugging code to show errors on map
                console.log(this);
                return "X";
            }
            else return this.i.tt();
        }
        else return this.tt;
    }
}

class monster {
    constructor() {
        this.colour = "darkTurquoise";
        this.health = 10;
        this.armour = 1;
        this.damage = 1;
    }

    t() { return "☻"; }
    tt() { return this.colour + " blob"; }

    takeDamage(d) { 
        this.health -= Math.max(1, d - this.armour);        // Minimum damage of 1
        this.health = Math.max(0, this.health);             // Non-negative health
        if (this.health <= 0) { this.colour = "dead"; }
    }
    isDead() { return this.health <= 0; }
}

class door {
    open = false;
    colour = "white";
    t() { return "+"; }
    tt() { return this.colour + " door " + (this.open ? "open" : "closed"); }
}

class gold {
    quantity = 1;
    t() { return "*"; }
    tt() { return "gold"; }
}

class key {
    colour = "white";
    t() { return "¬"; }
    tt() { return this.colour + " key"; }
}

class potion {
    colour = "white";
    t() { return "õ"; }
    tt() { return this.colour + " potion"; }
}

class weapon {
    name = "unidentified";
    damage = 0;

    t() { return "/"; }
    tt() { return "weapon (" + this.name + ")"; }
}
class armour {
    name = "unidentified";
    armour = 0;

    t() { return "▾"; }
    tt() { return "armour (" + this.name + ")"; }
}

// Known tile types
const TILES = {
    " ": { tt: "rock" },
    "": { tt: "rock" },
    "#": { tt: "wall" },
    ".": { tt: "floor" },
    "*": { tt: "gold", proto: () => new gold },
    "¬": { tt: "key", proto: () => new key },
    "õ": { tt: "potion", proto: () => new potion },
    "▾": { tt: "armour", proto: () => new armour },
    "/": { tt: "weapon", proto: () => new weapon },
    "+": { tt: "door", proto: () => new door },
    "☻": { tt: "monster", proto: () => new monster }
};

function parseMap(d, itemDefinitions) {
    console.log("Parsing");

    // Convert input text into array of arrays of characters (length 1 strings)
    var mapText = d3.dsvFormat("").parseRows(d).map(d => d[0].split('').map(d => d == " " ? "" : d));

    var y = 0;

    // Convert strings into cell description objects
    const mapData = mapText.map(function (a) {
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

        // Override tile symbol for parsing if player
        if (c == "@") {
            cell.p = true;
            c = ".";
        }

        // Attempt to find this cell in item definition metadata
        else if (itemDefinitions != null && itemDefinitions[c] != null) {
            for (const item of itemDefinitions[c]) {
                if (item.x == cell.x && item.y == cell.y) {
                    cell.i = item;
                }
            }

            if (cell.i == null) {
                console.log("No definition found: ", cell, c);
                // Create default if none exists
                cell.i = {};
            }

            // Set data object class from TILES dictionary lookup
            Object.setPrototypeOf(cell.i, TILES[c].proto());

            // Override tile symbol for parsing if known
            c = ".";
        }

        // Assign symbol and tile type
        cell.t = c;
        cell.tt = TILES[c].tt;

        return cell;
    }
}
