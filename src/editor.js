import { Cell, TILES } from "./map.js";
export { editor };

class editor {
    constructor() {
        this.gfx = {
            cellSize: 25,
            width: 1200,
            height: 450
        }
    }

    initialise() {
        this.gfx.svg = d3.select("#gfx").attr("viewBox", "0 0 " + (this.gfx.width) + " " + (this.gfx.height));
        this.gfx.pan = this.gfx.svg.append("g").attr("class", "pan");
        this.gfx.grid = this.gfx.pan.append("g").attr("class", "grid");

        console.log("Initialised");
    }
}
