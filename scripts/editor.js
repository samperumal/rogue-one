import { Cell, TILES } from "./map.js";
import { editorExport } from "./editorExport.js";
export { editor };

let editorGlobal;
document.addEventListener("DOMContentLoaded", function () {
    editorGlobal = new editor();
    editorGlobal.initialise();
});

class editor {
    constructor() {
        this.gfx = {
            cellSize: 25,
            width: 1000,
            height: 500
        };

        this.name = "untitled";
        this.mapData = [];
        this.mapArray = [];

        this.editedCell = null;
    }

    initialise() {
        this.gfx.zoom = d3.zoom()
            .scaleExtent([0.5, 3])
            .on("zoom", this.zoomed.bind(this));

        this.gfx.svg = d3.select("#gfx")
            .call(this.gfx.zoom)
            .on("dblclick.zoom", null);

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
        d3.select("#recreate").on("click", (() => { this.createGrid(); this.updateGrid(); }).bind(this));

        this.createGrid();

        this.updateGrid();

        d3.select("body").style("display", "");
    }

    zoomed() {
        this.gfx.pan.attr("transform", d3.event.transform);
    }

    createGrid() {
        const width = +d3.select("#width").property("value");
        const height = +d3.select("#height").property("value");

        this.gfx.svg.attr("viewBox", "0 0 " + (width * this.gfx.cellSize) + " " + (height * this.gfx.cellSize));

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
        const margin = 1;

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
        editorExport(this.name, this.mapData, TILES);
    }
}
