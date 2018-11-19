function loadMap() {
    return d3.text("map.txt").then(parseMap);
}

// Known tile types
var TILES = {
    "#": "wall",
    ".": "floor",
    "*": "gold",
};

class Cell {
    constructor(x, y) {
        this.x = x; // X-coordinate
        this.y = y; // Y-coordinate
        this.t = null; // Cell tile symbol
        this.tt = null; // Cell tile type
        this.p = false; // Player in cell
        this.i = null; // Item in cell
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
    gameState.mapData = mapText.map(function (a) {
        var x = 0;
        var row = a.map(function (c) {
            var cell = new Cell(x, y);
            var parseFn = parseDefault;

            switch (c) {
                case "@": parseFn = parsePlayer; break;
                case "+": parseFn = parseDoor; break;
                case "*": parseFn = parseGold; break;
            }

            parseFn(cell, c);

            x++;

            return cell;
        });
        y++;

        return row;
    });

    // Flatten map for rendering
    gameState.mapArray = gameState.mapData.reduce((a, b) => a.concat(b), []);

    function parsePlayer(cell, c) {
        parseDefault(cell, ".");
        cell.p = true;
        gameState.player.x = cell.x;
        gameState.player.y = cell.y;
    }

    function parseDoor(cell, c) {
        parseDefault(cell, ".");
        cell.i = new door();
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
    constructor() {
        this.open = false;
    }

    t() { return "+"; }

    tt() {
        if (this.open) return "door open";
        else return "door close";
    }
}

class gold {
    t() { return "*"; }

    tt() { return "gold"; }
}