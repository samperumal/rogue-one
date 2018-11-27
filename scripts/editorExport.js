export { editorExport };

function editorExport(name, mapData, TILES) {

    exportFile(name + ".txt", "text/plain", serializeMap(mapData));
    exportFile(name + ".json", "text/plain", serializeMapItems(mapData));

    function serializeMap(rows) {
        return rows.map(serializeMapRow).join("\r\n") + "\r\n";
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
        const allItems = [].concat(...rows.map(row => {
            return row
                // Choose only those cells which have items, and record their tile, position and properties
                .filter(cell => cell.i)
                .map(cell => ({ t: cell.t, x: cell.x, y: cell.y, props: { ...cell.i }, toJSON: serializeItem }));
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
        const allGroups = allItems.reduce(function (groups, item) {
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
