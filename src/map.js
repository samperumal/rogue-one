export { loadMap };

async function loadMap(url) {
    const downloads = [d3.text(url + ".txt"), d3.json(url + ".json")];
    const [mapText, mapJson] = await Promise.all(downloads);
    return parseMap(mapText, mapJson);
}

class Cell {
    constructor(x, y) {
        this.x = x; // X-coordinate
        this.y = y; // Y-coordinate
        this.t = null; // Cell tile symbol
        this.tt = null; // Cell tile type
        this.p = false; // Player in cell
        this.i = null; // Item in cell

        this.isVisible = false;
        this.hasBeenSeen = false;
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


class door {
    constructor() {
        this.open = false;
    }

    t() { return "+"; }
    tt() { return this.colour + " door " + (this.open ? "open" : "closed"); }
}

class gold {
    t() { return "*"; }
    tt() { return "gold"; }
}

class key {
    t() { return "¬"; }
    tt() { return this.colour + " key"; }
}

class potion {
    t() { return "õ"; }
    tt() { return this.colour + " potion"; }
}

class weapon {
    t() { return "/"; }
    tt() { return "weapon"; }
}
 class armour {
    t() { return "▾"; }
    tt() { return "armour"; }
}

// Known tile types
var TILES = {
    " ": { tt: "rock" },
    "": { tt: "rock" },
    "#": { tt: "wall" },
    ".": { tt: "floor" },
    "*": { tt: "gold", proto: new gold },
    "¬": { tt: "key", proto: new key },
    "õ": { tt: "potion", proto: new potion },
    "▾": { tt: "armour", proto: new armour },
    "/": { tt: "weapon", proto: new weapon },
    "+": { tt: "door", proto: new door },
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
            for (let item of itemDefinitions[c]) {
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
            Object.setPrototypeOf(cell.i, TILES[c].proto);

            // Override tile symbol for parsing if known
            c = ".";
        }

        // Assign symbol and tile type
        cell.t = c;
        cell.tt = TILES[c].tt;

        return cell;
    }
}
