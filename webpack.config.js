const path = require("path");

module.exports = {
    entry: "./src/game.js",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist")
    },
    optimization: {
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
    },
    module: {
        noParse: /d3/,
      }
};
