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

        this.name = "MyMap";
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

        d3.select("#tiles")
            .on("click", this.selectTile.bind(this), { capture: true })
            .selectAll("div.tile")
            .data(Object.entries(TILES).filter(d => d[0] != "" && d[0] != " "))
            .enter()
            .append("div")
            .attr("data-tile", d => d[0])
            .classed("tile", true)
            .text(d => d[0] + " [" + d[1].tt + "]");

        d3.select("#json-edit-save").on("click", () => this.editSaveClick());

        d3.select("#name")
            .property("value", this.name)
            .on("change", function () {
                editor.name = this.value;
            });

        d3.select("#showFileMgr").on("click", this.showFileMgr.bind(this));
        d3.select("#saveLocal").on("click", this.saveLocal.bind(this));
        d3.select("#loadLocal").on("click", this.loadLocal.bind(this));
        d3.select("#download").on("click", this.download.bind(this));

        d3.select("#recreate").on("click", function () {
            this.createGrid();
            this.updateGrid();
        }.bind(this));

        this.createGrid();

        this.updateGrid();

        d3.select("body").style("display", "");
    }

    selectTile() {
        const target = d3.event.target;
        const tile = target.dataset.tile;
        if (!tile || target.classList.contains("selected")) return;
        d3.select("#tiles")
            .selectAll("div.tile")
            .classed("selected", false);
        target.classList.add("selected");
    }

    zoomed() {
        this.gfx.pan.attr("transform", d3.event.transform);
    }

    createGrid() {
        const width = +d3.select("#width").property("value");
        const height = +d3.select("#height").property("value");

        let mapData = this.mapData;
        if (mapData == null) mapData = [];

        for (let y = 0; y < height; ++y) {
            if (mapData.length <= y)
                mapData.push([]);
            const row = mapData[y];

            for (let x = 0; x < width; ++x) {
                if (row.length <= x)
                    row.push(new Cell(x, y));

                let c = row[x];
                c.xoff = x * this.gfx.cellSize;
                c.yoff = y * this.gfx.cellSize;
            }

            mapData[y] = row.slice(0, width);
        }

        mapData = mapData.slice(0, height);

        this.mapData = mapData;

        this.drawGrid();
    }

    drawGrid() {
        const width = +d3.select("#width").property("value");
        const height = +d3.select("#height").property("value");

        this.gfx.svg.attr("viewBox", "0 0 " + (width * this.gfx.cellSize) + " " + (height * this.gfx.cellSize));

        const cellSize = this.gfx.cellSize;
        const margin = 1;

        // Clear all existing groups
        this.gfx.grid.selectAll("g.cell").remove();

        this.mapArray = this.mapData.reduce((a, b) => a.concat(b), []);

        const cells = this.gfx.grid.selectAll("g.cell")
            .data(this.mapArray);

        // Create new groups and populate with contents
        const newCells = cells.enter()
            .append("g")
            .attr("class", "cell")
            .each(d => Object.setPrototypeOf(d, new Cell))
            .attr("transform", d => "translate(" + (d.x * cellSize) + "," + (d.y * cellSize) + ")")
            .on("mouseenter", this.cellMouseEnter)
            .on("click", this.cellClick.bind(this))
            .on("dblclick", this.cellDoubleClick.bind(this));

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
        const selectedTile = d3.select("#tiles div.tile.selected").node();
        if (!selectedTile) return;
        const selection = selectedTile.dataset.tile;

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
        let data = JSON.parse(json);

        if (data.i) {
            Object.setPrototypeOf(data.i, this.editedCell.i);
            this.editedCell.i = data.i;
        }

        d3.select("#json-edit-text").property("value", "");
        d3.select("#json-properties-div").classed("hidden-edit", false);
        d3.select("#json-edit-div").classed("hidden-edit", true);

        this.updateGrid();
    }

    showFileMgr() {
        d3.selectAll(".file-mgr input").style("display", "inherit");
    }

    saveLocal() {
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem("mapData", JSON.stringify(this.mapData));
            localStorage.setItem("width", d3.select("#width").property("value"));
            localStorage.setItem("height", d3.select("#height").property("value"));
        }
        else console.log("Local Storage not supported!");
    }

    loadLocal() {
        if (typeof (Storage) !== "undefined") {
            const mapData = localStorage.getItem("mapData");
            const width = localStorage.getItem("width");
            const height = localStorage.getItem("height");

            if (mapData != null) {
                this.mapData = JSON.parse(mapData);

                d3.select("#width").property("value", width);
                d3.select("#height").property("value", height);

                this.drawGrid();
                this.updateGrid();
            }
        }
        else console.log("Local Storage not supported!");
    }

    download() {
        editorExport(this.name, this.mapData, TILES);
    }
}
