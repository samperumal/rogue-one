function loadMap() {
    return d3.text("map.txt").then(parseMap);
}

// Known tile types
var TILES = {
    "#": "wall",
    ".": "floor"
};

function Cell(x, y) {
    this.x = x; // X-coordinate
    this.y = y; // Y-coordinate
    this.t = null; // Cell tile symbol
    this.tt = null; // Cell tile type
    this.p = false; // Player in cell
    this.i = null // Item in cell
}

Cell.prototype.s = function () {
    if (this.p) return "@";
    else if (this.i != null) return this.i;
    else return this.t;
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

            if (c == "@") {
                cell.t = ".";
                cell.tt = TILES["."];
                cell.p = true;
                gameState.player.x = x;
                gameState.player.y = y;
            }
            else if (TILES[c] != null) {
                cell.t = c;
                cell.tt = TILES[c];
            }

            x++;

            return cell;
        });
        y++;

        return row;
    });

    // Flatten map for rendering
    gameState.mapArray = gameState.mapData.reduce((a, b) => a.concat(b), []);
}