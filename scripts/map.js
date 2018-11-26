export { loadMap, Cell, TILES, key, baseArmour, bucketHelm, weapon };

async function loadMap(url) {
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

    takeDamage(d) {
        this.health -= Math.max(1, d - this.armour); // Minimum damage of 1
        this.health = Math.max(0, this.health); // Non-negative health
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
        this.damage = 0;
    }

    t() {
        return "/";
    }
    tt() {
        return "weapon (" + this.name + ")";
    }

    applyEffect(playerStats) {
        playerStats.damage += this.damage;
    }
}

class baseArmour {
    constructor() {
        this.type = "base_armor";
        this.name = "unidentified";
        this.armour = 0;
    }

    t() {
        return "▾";
    }
    tt() {
        return "armour (" + this.name + ")";
    }

    applyEffect(playerStats) {
        playerStats.armour += this.armour;
    }
}

class bucketHelm {
    constructor() {
        this.type = "bucket_helm";
        this.name = "";
        this.armour = 0;
    }

    t() {
        return "▾";
    }
    tt() {
        return "armour (" + this.name + ")";
    }

    applyEffect(playerStats) {
        playerStats.visualRange = 0;
        playerStats.armour += this.armour;
    }
}

// Known tile types
const TILES = {
    " ": { tt: "rock" },
    "": { tt: "rock" },
    "#": { tt: "wall" },
    ".": { tt: "floor" },
    "*": { tt: "gold", proto: _ => new gold() },
    "¬": { tt: "key", proto: _ => new key() },
    õ: { tt: "potion", proto: _ => new potion() },
    "▾": {
        tt: "armour",
        proto: (/** @type {baseArmour | bucketHelm} */ v) => {
            switch (v.type) {
                case "bucket_helm":
                    return new bucketHelm();
                default:
                    return new baseArmour();
            }
        }
    },
    "/": { tt: "weapon", proto: _ => new weapon() },
    "+": { tt: "door", proto: _ => new door() },
    "☻": { tt: "monster", proto: () => new monster() }
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
            Object.setPrototypeOf(cell.i, TILES[c].proto(cell.i));

            // Override tile symbol for parsing if known
            c = ".";
        }

        // Assign symbol and tile type
        cell.t = c;
        cell.tt = TILES[c].tt;

        return cell;
    }
}
