/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/game.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/game.js":
/*!*********************!*\
  !*** ./src/game.js ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _map_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./map.js */ \"./src/map.js\");\n/* harmony import */ var _visibility_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./visibility.js */ \"./src/visibility.js\");\n/* harmony import */ var _input_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./input.js */ \"./src/input.js\");\n// To just import everything from all of d3, use this:\r\n//import * as d3 from \"d3\";\r\n\r\n\r\n\r\n\r\ndocument.addEventListener(\"DOMContentLoaded\", function () {\r\n    initialise();\r\n});\r\n\r\nvar gameState = {};\r\nvar inputState = new _input_js__WEBPACK_IMPORTED_MODULE_2__[\"InputStateMachine\"]([\r\n    new _input_js__WEBPACK_IMPORTED_MODULE_2__[\"Rule\"](key => {\r\n            switch (key) {\r\n                case \"KeyW\":\r\n                case \"ArrowUp\": return [0, -1];\r\n                case \"KeyS\":\r\n                case \"ArrowDown\": return [0, 1];\r\n                case \"KeyA\":\r\n                case \"ArrowLeft\": return [-1, 0];\r\n                case \"KeyD\":\r\n                case \"ArrowRight\": return [1, 0];\r\n                default: return false;\r\n            }\r\n        },\r\n        [],\r\n        coord => requestMove(...coord)\r\n    ),\r\n    // TODO(antonburger): Remove; testing guff to demo a multi-key sequence with context\r\n    new _input_js__WEBPACK_IMPORTED_MODULE_2__[\"Rule\"](\"KeyQ\", [\r\n        new _input_js__WEBPACK_IMPORTED_MODULE_2__[\"Rule\"](key => {\r\n                switch (key) {\r\n                    case \"Digit1\": return 1;\r\n                    case \"Digit2\": return 2;\r\n                    case \"Digit3\": return 3;\r\n                    default: return false;\r\n                }\r\n            },\r\n            [],\r\n            context => console.log(\"Quaffed potion \" + context))\r\n    ])\r\n]);\r\n\r\n// Called on game startup\r\nfunction initialise() {\r\n    // Setup global game state\r\n    gameState = {\r\n        // Display state\r\n        gfx: {\r\n            cellSize: 25,\r\n            width: 1200,\r\n            height: 450\r\n        },\r\n        // Player state\r\n        player: {\r\n            x: 0,\r\n            y: 0,\r\n            gold: 0,\r\n            items: [],\r\n            health: 5,\r\n        },\r\n        // Map data\r\n        mapData: null,\r\n        // Convenience copy of above for display\r\n        mapArray: null,\r\n        settings: {\r\n            checkLOS: true,\r\n            displayLOS: true,\r\n        }\r\n    };\r\n\r\n    // Capture display elements drawing/update operations\r\n    gameState.gfx.svg = d3.select(\"#gfx\");\r\n    gameState.gfx.content = gameState.gfx.svg.append(\"g\").attr(\"class\", \"content\");\r\n    gameState.gfx.floor = gameState.gfx.content.append(\"g\").attr(\"class\", \"floor\");\r\n    gameState.gfx.gold = d3.select(\"#gold\");\r\n\r\n    gameState.gfx.svg\r\n        .attr(\"viewBox\", \"0 0 \" + (gameState.gfx.width) + \" \" + (gameState.gfx.height));\r\n\r\n    gameState.gfx.content\r\n        .attr(\"transform\", \"translate(\" + (gameState.gfx.width / 2) + \",\" + (gameState.gfx.height / 2) + \")\");\r\n\r\n    // Call promise chain to load and draw map from file\r\n    Object(_map_js__WEBPACK_IMPORTED_MODULE_0__[\"loadMap\"])()\r\n        .then(map => {\r\n            gameState = { ...gameState, ...map };\r\n            const playerStart = map.mapArray.find(cell => cell.p);\r\n            gameState.player.x = playerStart.x;\r\n            gameState.player.y = playerStart.y;\r\n        })\r\n        .then(draw)\r\n        .then(update)\r\n        .then(function () {\r\n            // Attach general key listener\r\n            d3.select('body')\r\n                .on(\"keydown\", processInput)\r\n                .node()\r\n                .focus();\r\n\r\n            // Attach EnableLOS listener\r\n            d3.select(\"#enableLOS\")\r\n                .on(\"change\", function (d) {\r\n                    gameState.settings.checkLOS = d3.select(this).property(\"checked\");\r\n                    update();\r\n                });\r\n\r\n            // Attach DisplayLOS listener\r\n            d3.select(\"#displayLOS\")\r\n                .on(\"change\", function (d) {\r\n                    gameState.settings.displayLOS = d3.select(this).property(\"checked\");\r\n                    update();\r\n                });\r\n\r\n            console.log(\"Loaded\");\r\n        });\r\n}\r\n\r\n// Draw map when first loaded\r\nfunction draw() {\r\n    console.log(\"Drawing map\");\r\n\r\n    var gfx = gameState.gfx;\r\n\r\n    // Bind cell data to SVG groups\r\n    var allCells = gfx.floor.selectAll(\"g.cell\")\r\n        .data(gameState.mapArray, d => d.i);\r\n\r\n    // Create display elements for new data\r\n    allCells.enter()\r\n        .append(\"g\").attr(\"class\", \"cell\")\r\n        .attr(\"transform\", d => \"translate(\" + (d.x * gfx.cellSize) + \",\" + (d.y * gfx.cellSize) + \")\")\r\n        .append(\"text\")\r\n        .attr(\"transform\", d => \"translate(\" + (gfx.cellSize / 2) + \",\" + (gfx.cellSize / 2) + \")\");\r\n\r\n    // Remove display elements for removed elements\r\n    allCells.exit().remove();\r\n}\r\n\r\n// Update map after actions\r\nfunction update() {\r\n    console.log(\"Updating map\", gameState.settings.checkLOS);\r\n\r\n    var gfx = gameState.gfx;\r\n\r\n    // Update cell css class and text symbol\r\n    gfx.floor.selectAll(\"g.cell text\")\r\n        .attr(\"class\", d => d.css())\r\n        .text(d => d.s());\r\n\r\n    updateLOS();\r\n\r\n    gfx.gold.text(gameState.player.gold);\r\n\r\n    gfx.floor.attr(\"transform\", \"translate(\" + (-gameState.player.x * gfx.cellSize) + \",\" + (-gameState.player.y * gfx.cellSize) + \")\");\r\n}\r\n\r\nfunction updateLOS() {\r\n    // Perform LOS checks and updates\r\n    if (gameState.settings.checkLOS) {\r\n        // Calculate visibility between player and every other cell\r\n        const isVisible = Object(_visibility_js__WEBPACK_IMPORTED_MODULE_1__[\"lineOfSightTest\"])(gameState.mapArray)(gameState.player)\r\n        // Check whether each cell is currently visible\r\n        // Record change in visibility if never previously seen\r\n        gameState.mapArray.forEach(v => {\r\n            v.isVisible = isVisible(v);\r\n            if (v.hasBeenSeen && v.isVisible)\r\n                v.hasBeenSeen = true;\r\n        });\r\n\r\n        if (gameState.settings.displayLOS) {\r\n            // Update \r\n            gameState.gfx.floor.selectAll(\"g.cell text\")\r\n                .classed(\"hidden\", d => !d.isVisible)\r\n                .classed(\"hasBeenSeen\", d => d.hasBeenSeen);\r\n        }\r\n    }\r\n}\r\n\r\n// Process key input\r\nfunction processInput(d) {\r\n    if (inputState.evaluate(d3.event.code)) {\r\n        // Redraw map\r\n        update();\r\n    }\r\n\r\n    // TODO(antonburger): Remove testing guff\r\n    if (inputState.current.keySequence.length) {\r\n        console.log(\"Pressed \" + inputState.current.keySequence.join() + \" so far; waiting for more input.\");\r\n    }\r\n}\r\n\r\n// Attempt to move to new cell\r\nfunction requestMove(x, y) {\r\n    var player = gameState.player;\r\n    var currentCell = gameState.mapData[player.y][player.x];\r\n\r\n    var errorMessage = \"Can't move in the requested direction\";\r\n\r\n    if (gameState.mapData[player.y + y] != null && gameState.mapData[player.y + y][player.x + x] != null) {\r\n        var proposedCell = gameState.mapData[player.y + y][player.x + x];\r\n\r\n        // Find handler for target destination based on it's displayed symbol\r\n        var action = possibleDestinations[proposedCell.s()];\r\n        if (action != null) {\r\n            console.log(\"Processing action\");\r\n            action(currentCell, proposedCell);\r\n            errorMessage = \"\";\r\n        }\r\n    }\r\n\r\n    // Update/clear the error message\r\n    if (errorMessage != \"\")\r\n        error(errorMessage);\r\n}\r\n\r\nfunction error(msg) {\r\n    d3.select(\"#log\").insert(\"div\", \":first-child\").attr(\"class\", \"error\").text(msg);\r\n}\r\n\r\nfunction info(msg) {\r\n    d3.select(\"#log\").insert(\"div\", \":first-child\").attr(\"class\", \"info\").text(msg);\r\n}\r\n\r\nfunction update_inventory(item) {\r\n    gameState.player.items.push(item);\r\n    d3.select(\"#inventory\").append(\"div\", \":last-child\").attr(\"class\", \"info\").text(item);\r\n    info(\"You picked up a \" + item);\r\n}\r\n\r\nvar possibleDestinations = {\r\n    \".\": moveToSpace,\r\n    \"+\": moveThroughDoor,\r\n    \"*\": pickupGold,\r\n    \"¬\": pickupKey\r\n};\r\n\r\n// Simplest action function - just move the player to the new cell\r\nfunction moveToSpace(currentCell, proposedCell) {\r\n    currentCell.p = false;\r\n    proposedCell.p = true;\r\n    gameState.player.x = proposedCell.x;\r\n    gameState.player.y = proposedCell.y;\r\n}\r\n\r\nfunction moveThroughDoor(currentCell, proposedCell) {\r\n    var door = proposedCell.i;\r\n    if (!door.open) {\r\n        if (gameState.player.items.includes(door.colour + \" key\")) {\r\n            door.open = true;\r\n            info(\"You opened a \" + door.colour + \" door.\");\r\n        }\r\n        else {\r\n            error(\"You need a \" + door.colour + \" key.\");\r\n        }\r\n    }\r\n    else moveToSpace(currentCell, proposedCell);\r\n}\r\n\r\nfunction pickupGold(currentCell, proposedCell) {\r\n    moveToSpace(currentCell, proposedCell);\r\n    proposedCell.i = null;\r\n    gameState.player.gold += 1;\r\n    info(\"You picked up gold.\");\r\n}\r\n\r\nfunction pickupKey(currentCell, proposedCell) {\r\n    moveToSpace(currentCell, proposedCell);\r\n    var newKey = proposedCell.i;\r\n\r\n    if (!gameState.player.items.includes(newKey.tt())) {\r\n        update_inventory(newKey.tt());\r\n        proposedCell.i = null;\r\n    }\r\n    else {\r\n        info(\"You already have a \" + newKey.tt());\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/game.js?");

/***/ }),

/***/ "./src/input.js":
/*!**********************!*\
  !*** ./src/input.js ***!
  \**********************/
/*! exports provided: InputStateMachine, Rule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"InputStateMachine\", function() { return InputStateMachine; });\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"Rule\", function() { return Rule; });\n\r\n\r\n// A state machine to handle sequences of input keys\r\nclass InputStateMachine {\r\n    /** @param {Rule[]} rules */\r\n    constructor(rules) {\r\n        this.rules = rules;\r\n        // Current state in the case of multi-key input sequences.\r\n        this.current = {\r\n            ruleSet: rules,\r\n            keySequence: [],\r\n            context: null\r\n        }\r\n    }\r\n\r\n    // Evaluate a single key according to current state.\r\n    // If the key matches no rules, reset the state.\r\n    // Otherwise, if the key matches a [sub-]rule, transition to its state.\r\n    // If the new state defines an action, invoke the action with the context accumulated so far.\r\n    // If the new state has no further child rules, finish by resetting the state and return true to indicate the end of a key sequence.\r\n    evaluate(key) {\r\n        // current.ruleSet is either the top-level rules or the child rules of the last-matched rule.\r\n        for (let rule of this.current.ruleSet) {\r\n            const result = rule.evaluate(key);\r\n            if (result.match) {\r\n                this.current.ruleSet = rule.childRules;\r\n                this.current.keySequence.push(key);\r\n                if (\"context\" in result) {\r\n                    this.current.context = result.context;\r\n                }\r\n\r\n                if (rule.action) {\r\n                    rule.action(this.current.context);\r\n                }\r\n\r\n                if (!rule.childRules.length) {\r\n                    this.reset();\r\n                    return true;\r\n                }\r\n\r\n                return false;\r\n            }\r\n        }\r\n\r\n        this.reset();\r\n        return false;\r\n    }\r\n\r\n    reset() {\r\n        this.current.ruleSet = this.rules;\r\n        this.current.keySequence = [];\r\n        this.current.context = null;\r\n    }\r\n}\r\n\r\nclass Rule {\r\n    /**\r\n       A trigger is either:\r\n         * A comma-separated list of named keyboard keys accepted by the rule, OR\r\n         * A function which accepts the named pressed key and returns a value indicating acceptance or not\r\n       If the latter, the function can return either:\r\n         * true or false, to indicate \"accepted\" or \"not accepted\"\r\n         * Any other value, indicating implicit acceptance along with a context value which is passed to\r\n           subsequent rule triggers and rule actions.\r\n       Action is optional and will be invoked on each matching rule in a sequence, not just terminal ones.\r\n     * @param {string|((key: string) => boolean|any)} trigger\r\n     * @param {Rule[]} childRules\r\n     * @param {(context: any) => any} action \r\n     */\r\n    constructor(trigger, childRules, action) {\r\n        this.trigger = typeof trigger === \"string\" ? namedKeyTrigger(trigger) : trigger;\r\n        this.childRules = childRules;\r\n        this.action = action;\r\n\r\n        function namedKeyTrigger(targetKeys) {\r\n            const keys = targetKeys.split(\",\").map(s => s.trim());\r\n            // Simple trigger which just returns true or false, with no context\r\n            return key => keys.includes(key);\r\n        }\r\n    }\r\n\r\n    /** @returns {{ match: boolean, context?: any }} */\r\n    evaluate(key, context) {\r\n        const result = this.trigger(key, context);\r\n        if (typeof result === \"boolean\") {\r\n            return { match: result };\r\n        } else {\r\n            return { match: true, context: result };\r\n        }\r\n    }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/input.js?");

/***/ }),

/***/ "./src/map.js":
/*!********************!*\
  !*** ./src/map.js ***!
  \********************/
/*! exports provided: loadMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"loadMap\", function() { return loadMap; });\n// To just import everything from all of d3, use this:\r\n//import * as d3 from \"d3\";\r\n\r\nfunction loadMap() {\r\n    return d3.text(\"map.txt\").then(parseMap);\r\n}\r\n\r\n// Known tile types\r\nvar TILES = {\r\n    \"#\": \"wall\",\r\n    \".\": \"floor\",\r\n    \"*\": \"gold\",\r\n    \"¬\": \"key\"\r\n};\r\n\r\nclass Cell {\r\n    constructor(x, y) {\r\n        this.x = x; // X-coordinate\r\n        this.y = y; // Y-coordinate\r\n        this.t = null; // Cell tile symbol\r\n        this.tt = null; // Cell tile type\r\n        this.p = false; // Player in cell\r\n        this.i = null; // Item in cell\r\n\r\n        this.isVisible = false;\r\n        this.hasBeenSeen = false; \r\n    }\r\n\r\n    // Display symbol\r\n    s() {\r\n        if (this.p)\r\n            return \"@\";\r\n        else if (this.i != null)\r\n            return this.i.t();\r\n        else\r\n            return this.t;\r\n    }\r\n\r\n    css() {\r\n        if (this.p) return \"player\";\r\n        else if (this.i != null) return this.i.tt();\r\n        else return this.tt;\r\n    }\r\n}\r\n\r\n\r\nfunction parseMap(d) {\r\n    console.log(\"Parsing\");\r\n    // Convert input text into array of arrays of characters (length 1 strings)\r\n    var mapText = d3.dsvFormat(\"\").parseRows(d).map(d => d[0].split('').map(d => d == \" \" ? \"\" : d));\r\n\r\n    //var maxLen = mapText.reduce((a, b) => Math.max(a, b.length), 0);\r\n\r\n    var y = 0;\r\n\r\n    // Convert strings into cell description objects\r\n    const mapData = mapText.map(function (a) {\r\n        var x = 0;\r\n        var row = a.map(function (c) {\r\n            var cell = new Cell(x, y);\r\n            var parseFn = parseDefault;\r\n\r\n            switch (c) {\r\n                case \"@\": parseFn = parsePlayer; break;\r\n                case \"+\": parseFn = parseDoor; break;\r\n                case \"*\": parseFn = parseGold; break;\r\n                case \"¬\": parseFn = parseKey; break;\r\n            }\r\n\r\n            parseFn(cell, c);\r\n\r\n            x++;\r\n\r\n            return cell;\r\n        });\r\n        y++; \r\n\r\n        return row;\r\n    });\r\n\r\n    // Flatten map for rendering\r\n    const mapArray = mapData.reduce((a, b) => a.concat(b), []);\r\n\r\n    return {mapData, mapArray};\r\n\r\n    function parsePlayer(cell, c) {\r\n        parseDefault(cell, \".\");\r\n        cell.p = true;\r\n    }\r\n\r\n    function parseDoor(cell, c) {\r\n        parseDefault(cell, \".\");\r\n        cell.i = new door(cell.x%2 ? \"red\" : \"green\");\r\n    }\r\n\r\n    function parseGold(cell, c) {\r\n        parseDefault(cell, \".\");\r\n        cell.i = new gold();\r\n    }\r\n\r\n    function parseKey(cell, c) {\r\n        parseDefault(cell, \".\");\r\n        // TODO(mstankiewicz): Sorry, testing hacks\r\n        cell.i = new key(cell.x%2 ? \"red\" : \"green\");\r\n    }\r\n\r\n    function parseDefault(cell, c) {\r\n        cell.t = c;\r\n        cell.tt = TILES[c];\r\n    }\r\n}\r\n\r\nclass door {\r\n    constructor(colour) {\r\n        this.open = false;\r\n        this.colour = colour;\r\n    }\r\n\r\n    t() { return \"+\"; }\r\n\r\n    tt() {\r\n        return this.colour + \" door \" + (this.open ? \"open\" : \"closed\");\r\n    }\r\n}\r\n\r\nclass gold {\r\n    t() { return \"*\"; }\r\n\r\n    tt() { return \"gold\"; }\r\n}\r\n\r\nclass key {\r\n    constructor(colour) {\r\n        this.colour = colour;\r\n    }\r\n\r\n    t() { return \"¬\"; }\r\n\r\n    tt() { return this.colour + \" key\"; }\r\n}\r\n\n\n//# sourceURL=webpack:///./src/map.js?");

/***/ }),

/***/ "./src/visibility.js":
/*!***************************!*\
  !*** ./src/visibility.js ***!
  \***************************/
/*! exports provided: lineOfSightTest */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"lineOfSightTest\", function() { return lineOfSightTest; });\nconst dotProduct = ([x1, y1], [x2, y2]) => x1 * x2 + y1 * y2\r\n\r\nconst circleIntersectsLine = line => circle => {\r\n    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = line\r\n    const { x, y, radius } = circle\r\n\r\n    const ac = [x - x1, y - y1]\r\n    const ab = [x2 - x1, y2 - y1]\r\n    const ab2 = dotProduct(ab, ab)\r\n    const acab = dotProduct(ac, ab)\r\n    var t = acab / ab2\r\n    t = (t < 0) ? 0 : t\r\n    t = (t > 1) ? 1 : t\r\n    var h = [(ab[0] * t + x1) - x, (ab[1] * t + y1) - y]\r\n    var h2 = dotProduct(h, h)\r\n    return h2 <= radius * radius\r\n}\r\n\r\nconst blocksLineOfSight = point => point.tt == \"wall\";\r\n\r\nconst isBig = blocksLineOfSight\r\n\r\n// Small objects: test visibility of center point \r\n// Large objects: test visibility of closest corner \r\nconst adjustForSize = line => {\r\n    if (!isBig(line[1])) return line;\r\n    const vector = {\r\n        x: line[1].x - line[0].x,\r\n        y: line[1].y - line[0].y\r\n    }\r\n    return [line[0], {\r\n        x: line[1].x - Math.sign(vector.x),\r\n        y: line[1].y - Math.sign(vector.y)\r\n    }]\r\n}\r\n\r\nconst lineOfSightTest = world => fromPoint => toPoint => {\r\n    const line = adjustForSize([fromPoint, toPoint])\r\n    return world\r\n        .filter(blocksLineOfSight)\r\n        .filter(v => v != fromPoint && v != toPoint) // an object should not block LOS to itself \r\n        .map(v => ({ ...v, radius: 0.5 }))\r\n        .filter(circleIntersectsLine(line))\r\n        .length == 0;\r\n}\n\n//# sourceURL=webpack:///./src/visibility.js?");

/***/ })

/******/ });