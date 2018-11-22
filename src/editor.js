import { Cell, TILES } from "./map.js";
export { editor };

class editor {
    constructor() {
        this.gfx = {
            cellSize: 25,
            width: 1200,
            height: 450
        };

        this.mapData = [];
        this.mapArray = [];
    }

    initialise() {
        this.gfx.svg = d3.select("#gfx").attr("viewBox", "0 0 " + (this.gfx.width) + " " + (this.gfx.height));
        this.gfx.pan = this.gfx.svg.append("g").attr("class", "pan");
        this.gfx.grid = this.gfx.pan.append("g").attr("class", "grid");

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
        const margin = 2;

        // Clear all existing groups
        this.gfx.grid.selectAll("g.cell").remove();

        const cells = this.gfx.grid.selectAll("g.cell")
            .data(this.mapArray);

        // Necessary to maintain parent reference across events
        const obj = this;

        // Create new groups and populate with contents
        const newCells = cells.enter()
            .append("g")
            .attr("class", "cell")
            .attr("transform", d => "translate(" + (d.x * cellSize) + "," + (d.y * cellSize) + ")")            
            .on("mouseenter", this.cellMouseEnter)
            .on("click", d => this.cellClick(d, obj));

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

    cellClick(data, obj) {
        data.t = "#";
        data.tt = TILES["#"].tt;

        obj.updateGrid();
        obj.cellMouseEnter(data);
    }
}
