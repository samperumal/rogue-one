import { Cell, TILES } from "./map.ts";
export { editor };

class editor {
    constructor() {
        this.gfx = {
            cellSize: 25,
            width: 1200,
            height: 450
        };

        this.name = "untitled";
        this.mapData = [];
        this.mapArray = [];

        this.editedCell = null;
    }

    initialise() {
        const editor = this;
        this.gfx.svg = d3.select("#gfx").attr("viewBox", "0 0 " + (this.gfx.width) + " " + (this.gfx.height));
        this.gfx.pan = this.gfx.svg.append("g").attr("class", "pan");
        this.gfx.grid = this.gfx.pan.append("g").attr("class", "grid");

        d3.select("#tile")
            .selectAll("option")
            .data(Object.entries(TILES).filter(d => d[0] != "" && d[0] != " "))
            .enter()
            .append("option")
            .attr("value", d => d[0])
            .text(d => d[0] + " [" + d[1].tt + "]");

        d3.select("#json-edit-save").on("click", () => this.editSaveClick());

        d3.select("#name")
            .property("value", this.name)
            .on("change", function() {
                editor.name = this.value;
            });

        d3.select("#export").on("click", this.export.bind(this));

        this.createGrid();

        this.updateGrid();
    }

    createGrid() {
        const width = +d3.select("#width").property("value");
        const height = +d3.select("#height").property("value");

        this.mapData = [];
        for (let y = 0; y < height; ++y) {
            const row = [];
            for (let x = 0; x < width; ++x) {
                let c = new Cell(x, y);
                //c.editor = this;
                row.push(c);
            }
            this.mapData.push(row);
        }

        this.mapArray = this.mapData.reduce((a, b) => a.concat(b), []);

        this.drawGrid();
    }

    drawGrid() {
        const cellSize = this.gfx.cellSize;
        const margin = 0;

        // Clear all existing groups
        this.gfx.grid.selectAll("g.cell").remove();

        const cells = this.gfx.grid.selectAll("g.cell")
            .data(this.mapArray);

        const obj = this;

        // Create new groups and populate with contents
        const newCells = cells.enter()
            .append("g")
            .attr("class", "cell")
            .attr("transform", d => "translate(" + (d.x * cellSize) + "," + (d.y * cellSize) + ")")
            .on("mouseenter", this.cellMouseEnter)
            // Necessary to maintain parent reference across events)
            .on("click", d => obj.cellClick(d))
            .on("dblclick", d => obj.cellDoubleClick(d));

        newCells
            .append("text")
            .attr("x", cellSize / 2)
            .attr("y", cellSize / 2);

        newCells
            .append("rect")
            .attr("class", "cellbg")
            .attr("x", margin)
            .attr("y", margin)
            .attr("width", cellSize - margin)
            .attr("height", cellSize - margin);


    }

    updateGrid() {
        const cells = this.gfx.grid.selectAll("g.cell");

        cells.select("text")
            .text(d => d.s())
            .attr("class", d => d.css());
    }

    cellMouseEnter(data) {
        d3.select("#json-properties").text(JSON.stringify(data, null, 2));
    }

    cellClick(data) {
        let selection = d3.select("#tile").node().value;

        if (TILES[selection].proto != null) {
            data.i = TILES[selection].proto();
        }

        data.t = selection;
        data.tt = TILES[selection].tt;

        this.updateGrid();
        this.cellMouseEnter(data);
    }

    cellDoubleClick(data) {
        d3.select("#json-properties-div").classed("hidden-edit", true);
        d3.select("#json-edit-div").classed("hidden-edit", false);

        d3.select("#json-edit-text").property("value", JSON.stringify(data, null, 2));

        this.editedCell = data;
    }

    editSaveClick() {
        let json = d3.select("#json-edit-text").property("value");
        console.log(json);
        let data = JSON.parse(json);
        console.log(data);

        if (data.i) {
            Object.setPrototypeOf(data.i, this.editedCell.i);
            this.editedCell.i = data.i;
        }

        d3.select("#json-edit-text").property("value", "");

        d3.select("#json-properties-div").classed("hidden-edit", false);
        d3.select("#json-edit-div").classed("hidden-edit", true);

        this.updateGrid();
    }

    export() {
        exportFile(this.name + ".txt", "text/plain", serializeMap(this.mapData));
        exportFile(this.name + ".json", "text/plain", serializeMapItems(this.mapData));

        function serializeMap(rows) {
            return rows.map(serializeMapRow).join("\r\n");
        }

        function serializeMapRow(cells) {
            // Convert each cell object to its tile
            return cells
                .map(function (cell) {
                    return !cell.t || cell.t === "rock"
                        ? " "
                        : findKeyByValue(TILES, tile => tile.tt === cell.tt);
                })
                .join("");
        }

        function serializeMapItems(rows) {
            const tiles = Object.keys(TILES);
            const allItems = Array.concat(...rows.map(row => {
                return row
                    // Choose only those cells which have items, and record their tile, position and properties
                    .filter(cell => cell.i)
                    .map(cell => ({ t: cell.t, x: cell.x, y: cell.y, props: {...cell.i}, toJSON: serializeItem }));
            }));

            // Sort by tile then y then x
            allItems.sort(function (a, b) {
                const tileA = tiles.indexOf(a.t);
                const tileB = tiles.indexOf(b.t);
                if (tileA !== tileB) return tileA - tileB;
                if (a.y !== b.y) return a.y - b.y;
                return a.x - b.x;
            });

            // Put each group of the same item in a separate array, and put all the arrays in an object with arrays indexed by tile
            // This is the map.json format
            const allGroups = allItems.reduce(function(groups, item) {
                const group = groups[item.t] || (groups[item.t] = []);
                group.push(item);
                return groups;
            }, {});

            // stringify produces line feeds only, so make the result Windows-friendly
            return JSON
                .stringify(allGroups, null, 4)
                .replace(/\n/g, "\r\n");

            // Function used to stringify an item
            // Omit the t value, and hopefully output x and y before any item-specific properties, though technically this isn't guaranteed
            function serializeItem() {
                return {
                    x: this.x,
                    y: this.y,
                    ...this.props
                }
            }
        }

        // Find the first property name whose value matches a predicate
        function findKeyByValue(obj, valuePredicate) {
            return Object.keys(obj).find(key => valuePredicate(obj[key]));
        }

        // On Firefox at least, invalid characters in the filename get converted to underscores
        function exportFile(filename, mimeType, contents) {
            const a = document.createElement("a");
            const blob = new Blob([contents], { type: mimeType });
            const url = URL.createObjectURL(blob);
            a.style = "display: none";
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            // Suggestions online that these 2 lines should be wrapped in a setTimeout(..., 0)
            // or it breaks on Firefox, but that doesn't seem to be the case.
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
}
