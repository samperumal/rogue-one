export { loadMap };

function loadMap(url) {
    return d3.text(url + ".txt")
        .then(mapText =>
            d3.json(url + ".json").then(mapJson => parseMap(mapText, mapJson))
        );
}

// Known tile types
var TILES = {
    "#": "wall",
    ".": "floor",
    "*": "gold",
    "¬": "key",
    "+": "door"
};

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
    var cell = new Cell(x, y);

    // Override tile symbol for parsing if player
    if (c == "@") {
        cell.p = true;
        c = ".";
    }

    // Attempt to find this cell in item definition metadata
    else if (itemDefinitions != null && itemDefinitions[c] != null) {
        for (var i in itemDefinitions[c]) {
            var item = itemDefinitions[c][i];
            if (item.x == cell.x && item.y == cell.y) {
                cell.i = item;
            }
        }

        if (cell.i == null) {
            console.log("No definition found: ", cell, c);
            // Create default if none exists
            cell.i = {};
        }

        switch (c) {
            case "+": Object.setPrototypeOf(cell.i, new door); break;
            case "*": Object.setPrototypeOf(cell.i, new gold); break;
            case "¬": Object.setPrototypeOf(cell.i, new key); break;
        }

        // Override tile symbol for parsing if known
        c = ".";
    }

    // Assign symbol and tile type
    cell.t = c;
    cell.tt = TILES[c];

    return cell;
}
}
class door {
    constructor() {
        this.open = false;
        this.colour = null;
    }

    t() { return "+"; }

    tt() {
        return this.colour + " door " + (this.open ? "open" : "closed");
    }
}

class gold {
    t() { return "*"; }

    tt() { return "gold"; }
}

class key {
    constructor() {
        this.colour = null;
    }

    t() { return "¬"; }

    tt() { return this.colour + " key"; }
}
