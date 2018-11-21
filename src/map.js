export { loadMap };

function loadMap(url) {
    return d3.text(url)
        .then(parseMap);
}

// Known tile types
var TILES = {
    "#": "wall",
    ".": "floor",
    "*": "gold",
    "¬": "key"
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
        else if (this.i != null) return this.i.tt();
        else return this.tt;
    }
}


function parseMap(d) {
    console.log("Parsing");
    // Convert input text into array of arrays of characters (length 1 strings)
    var mapText = d3.dsvFormat("").parseRows(d).map(d => d[0].split('').map(d => d == " " ? "" : d));

    //var maxLen = mapText.reduce((a, b) => Math.max(a, b.length), 0);

    var y = 0;

    // Convert strings into cell description objects
    const mapData = mapText.map(function (a) {
        var x = 0;
        var row = a.map(function (c) {
            var cell = new Cell(x, y);
            var parseFn = parseDefault;
            var object_type = null;

            // Maybe can distinguish by player, gold, inventory item, monster, etc?
            switch (c) {
                case "@": parseFn = parsePlayer; break;
                case "+": parseFn = parseItem; object_type = door; break;
                case "¬": parseFn = parseItem; object_type = key; break;
                case "*": parseFn = parseGold; break;
            }

            parseFn(cell, c, object_type);

            x++;

            return cell;
        });
        y++; 

        return row;
    });

    // Flatten map for rendering
    const mapArray = mapData.reduce((a, b) => a.concat(b), []);

    return {mapData, mapArray};

    // General function for items
    function parseItem(cell, c, item_type) {
        parseDefault(cell, ".");
        cell.i = new item_type(cell.x%2 ? "red" : "green");
    }

    function parsePlayer(cell, c) {
        parseDefault(cell, ".");
        cell.p = true;
    }

    function parseGold(cell, c) {
        parseDefault(cell, ".");
        cell.i = new gold();
    }

    function parseDefault(cell, c) {
        cell.t = c;
        cell.tt = TILES[c];
    }
}

class door {
    constructor(colour) {
        this.open = false;
        this.colour = colour;
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
    constructor(colour) {
        this.colour = colour;
    }

    t() { return "¬"; }

    tt() { return this.colour + " key"; }
}
