export { gfx };

class gfx {
    constructor() {
        this.cellSize = 25;

        // Capture display elements drawing/update operations
        this.svg = d3.select("#gfx");
        this.content = this.svg.append("g").attr("class", "content");
        this.floor = this.content.append("g").attr("class", "floor");
        this.gold = d3.select("#gold");
        this.health = d3.select("#health");
        this.armour = d3.select("#armourlevel");
        this.damage = d3.select("#weaponLevel");

        this.symbol = function (data) {
            if (data.entities != null && data.entities.length > 0) {
                return data.entities[0].symbol;
            }
            else if (data.items != null && data.items.length > 0)
                return data.items[0].symbol;
            else if (data.structure == null)
                return "X";
            else if (data.structure.symbol == null)
                return "[" + data.x + "][" + data.y + "]";
            else return data.structure.symbol;
        }

        this.css = function(data) {
            if (data.structure.symbol == null)
                return "coord";
            else return null;
        }
    }

    draw(mapArray) {
        console.log("Drawing map");

        let [xmin, xmax] = d3.extent(mapArray, d => d.x);
        let [ymin, ymax] = d3.extent(mapArray, d => d.y);

        let width = (xmax - xmin + 1) * this.cellSize;
        let height = (ymax - ymin + 1) * this.cellSize;

        this.svg.attr("viewBox", "0 0 " + (width) + " " + (height));

        // Bind cell data to SVG groups
        var allCells = this.floor.selectAll("g.cell")
            .data(mapArray, d => d.i);

        // Create display elements for new data
        allCells.enter()
            .append("g").attr("class", "cell")
            .attr("transform", d => "translate(" + (d.x * this.cellSize) + "," + (d.y * this.cellSize) + ")")
            .append("text")
            .attr("transform", d => "translate(" + (this.cellSize / 2) + "," + (this.cellSize / 2) + ")");

        // Remove display elements for removed elements
        allCells.exit().remove();
    }

    update(center) {
        // Update cell css class and text symbol
        this.floor.selectAll("g.cell text")
            .attr("class", this.css)
            .text(this.symbol);

        //this.floor.attr("transform", "translate(" + (-center.x * this.cellSize) + "," + (-center.y * this.cellSize) + ")");
    }
}
