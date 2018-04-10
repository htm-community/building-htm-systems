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
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/cell-viz/src/SdrDrawing.js":
/*!*************************************************!*\
  !*** ./node_modules/cell-viz/src/SdrDrawing.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/* From http://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage */\nfunction getGreenToRed(percent) {\n    let r, g;\n    percent = 100 - percent;\n    r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);\n    g = percent > 50 ? 255 : Math.floor(percent * 2 * 255 / 100);\n    return rgbToHex(r, g, 0);\n}\n\n/* From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */\nfunction rgbToHex(r, g, b) {\n    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);\n}\n\nfunction datumIsOn(d) {\n    return d !== null && d > 0;\n}\n// function datumIsConnected(d, threshold) {\n//     return d !== null && threshold !== null && d > threshold\n// }\n\nlet defaultOpts = {\n    width: 400,\n    height: 400,\n    threshold: undefined,\n    gradientFill: false,\n    onColor: 'skyblue',\n    offColor: 'white',\n    connectionColor: 'royalblue',\n    lineColor: 'teal'\n};\n\nfunction SdrDrawing(permanences, element) {\n    this.permanences = permanences;\n    this.el = element;\n    this.$drawing = undefined;\n}\n\nSdrDrawing.prototype._snapDrawOptionsToBox = function (opts) {\n    let w = opts.width;\n    let h = opts.height;\n    let area = w * h;\n    let numBoxes = this.permanences.length;\n    let cellSize = Math.floor(Math.sqrt(area / numBoxes) * .95);\n    let repeatX = Math.floor(w / cellSize);\n    opts.cellSize = cellSize;\n    opts.rowLength = repeatX;\n    return opts;\n};\n\nSdrDrawing.prototype.onCell = function (eventName, fn) {\n    this.$drawing.selectAll('rect.bit').on(eventName, fn);\n    return this;\n};\n\nSdrDrawing.prototype.onConnection = function (eventName, fn) {\n    this.$drawing.selectAll('circle.connection').on(eventName, fn);\n    return this;\n};\n\nSdrDrawing.prototype.drawLinesTo = function (coords) {\n    let data = this.$drawing.selectAll('rect.bit').data();\n    let opts = this.drawOptions;\n\n    function renderLines(ls) {\n        ls.attr('class', 'line').attr('visibility', (d, i) => {\n            if (datumIsOn(d)) return 'visible';else return 'hidden';\n        }).attr('stroke', opts.lineColor).attr('stroke-width', 1.0).attr('x1', function (d, i) {\n            let offset = i % opts.rowLength;\n            return offset * opts.cellSize + opts.cellSize / 2;\n        }).attr('y1', function (d, i) {\n            let offset = Math.floor(i / opts.rowLength);\n            return offset * opts.cellSize + opts.cellSize / 2;\n        }).attr('x2', coords[0]).attr('y2', coords[1]);\n    }\n\n    // Update\n    let lines = this.$drawing.selectAll('line.line').data(data);\n    renderLines(lines);\n\n    // Enter\n    let newLines = lines.enter().append('line');\n    renderLines(newLines);\n\n    // Exit\n    lines.exit().remove();\n\n    return this;\n};\n\nSdrDrawing.prototype.draw = function (options) {\n    let perms = this.permanences;\n    let opts = this._snapDrawOptionsToBox(Object.assign({}, defaultOpts, options));\n    let threshold = opts.threshold;\n    this.$drawing = d3.select('#' + this.el).attr('width', opts.width).attr('height', opts.height);\n\n    function renderCell(r, c) {\n        r.attr('class', 'bit').attr('fill', d => {\n            if (d === null) return opts.offColor;\n            if (d > 0) {\n                if (opts.gradientFill) return '#' + getGreenToRed(d * 100);else return opts.onColor;\n            }\n            return opts.offColor;\n        }).attr('stroke', 'darkgrey').attr('stroke-width', 0.5).attr('fill-opacity', 1).attr('x', function (d, i) {\n            let offset = i % opts.rowLength;\n            return offset * opts.cellSize;\n        }).attr('y', function (d, i) {\n            let offset = Math.floor(i / opts.rowLength);\n            return offset * opts.cellSize;\n        }).attr('width', opts.cellSize).attr('height', opts.cellSize);\n\n        if (c) {\n            c.attr('class', 'connection').attr('fill', opts.connectionColor).attr('cx', function (d) {\n                let i = d.index;\n                let offset = i % opts.rowLength;\n                return offset * opts.cellSize + opts.cellSize / 2;\n            }).attr('cy', function (d) {\n                let i = d.index;\n                let offset = Math.floor(i / opts.rowLength);\n                return offset * opts.cellSize + opts.cellSize / 2;\n            }).attr('r', opts.cellSize / 4);\n        }\n    }\n\n    // Update\n    let rects = this.$drawing.selectAll('rect.bit').data(perms);\n    let circs;\n    // Only create circles if there is a threshold defined for connections.\n    if (threshold !== undefined) {\n        let permObjs = perms.map((p, i) => {\n            return {\n                index: i,\n                permanence: p\n            };\n        }).filter(p => {\n            return p.permanence !== null && p.permanence > threshold;\n        });\n        circs = this.$drawing.selectAll('circle.connection').data(permObjs);\n    }\n    renderCell(rects, circs);\n\n    // Enter\n    let newRects = rects.enter().append('rect');\n    let newCircs;\n    if (threshold !== undefined) {\n        newCircs = circs.enter().append('circle');\n    }\n    renderCell(newRects, newCircs);\n\n    // Exit\n    rects.exit().remove();\n    if (threshold !== undefined) {\n        circs.exit().remove();\n    }\n\n    // Stash the draw options we used\n    this.drawOptions = opts;\n\n    return this;\n};\n\nmodule.exports = SdrDrawing;\n\n//# sourceURL=webpack:///./node_modules/cell-viz/src/SdrDrawing.js?");

/***/ }),

/***/ "./node_modules/cell-viz/src/SdrUtils.js":
/*!***********************************************!*\
  !*** ./node_modules/cell-viz/src/SdrUtils.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let DEFAULT_SPARSITY = 0.02;\n\n/***** Private TOOLS *****/\n\n// a tool to loop x times\nfunction times(count, fn) {\n    for (let i = 0; i < count; i++) {\n        fn(i);\n    }\n}\n\nfunction getRandomInt(min, max) {\n    return Math.floor(Math.random() * (max - min)) + min;\n}\n\nfunction flip(bit) {\n    if (bit === 0) return 1;\n    return 0;\n}\n\nfunction overflowSafeUniqueness(n, w) {\n    let bigN = math.bignumber(n);\n    let bigW = math.bignumber(w);\n\n    let nf = math.factorial(bigN);\n    let wf = math.factorial(bigW);\n    let nwf = math.factorial(math.subtract(bigN, bigW));\n\n    return math.divide(nf, math.multiply(wf, nwf));\n}\n\nfunction closeEnoughSparsity(a, b) {\n    let diff = Math.abs(a - b);\n    // Close enough if within one percent.\n    return diff <= 0.01;\n}\n\n/***** PUBLIC functions start here *****/\n\n/*********\n CREATE\n*********/\n\nfunction getRandom(n, w) {\n    let out = [];\n    let randomIndex;\n    let sparsity;\n\n    if (w === undefined) {\n        w = n * DEFAULT_SPARSITY;\n    }\n\n    sparsity = w / n;\n\n    // Fill array with zeros.\n    while (out.length < n) {\n        out.push(0);\n    }\n    // If not sparse enough, randomly flip 0 bits to 1.\n    while (population(out) / n < sparsity) {\n        // Make a random 0 bit into a 1.\n        randomIndex = getRandomInt(0, n);\n        if (out[randomIndex] === 0) {\n            out[randomIndex] = 1;\n        }\n    }\n\n    return out;\n}\n\nfunction getEmpty(n) {\n    let out = [];\n\n    times(n, function () {\n        out.push(0);\n    });\n    return out;\n}\n\n/*********\n INSPECT\n *********/\n\nfunction getActiveBits(sdr) {\n    let active = [];\n    sdr.forEach((bit, i) => {\n        if (bit === 1) active.push(i);\n    });\n    return active;\n}\n\nfunction getInactiveBits(sdr) {\n    let inactive = [];\n    sdr.forEach((bit, i) => {\n        if (bit === 0) inactive.push(i);\n    });\n    return inactive;\n}\n\nfunction population(sdr) {\n    return sdr.reduce(function (sum, n) {\n        return sum + n;\n    }, 0);\n}\n\nfunction sparsity(sdr) {\n    let onBits = sdr.filter(bit => {\n        return bit === 1;\n    }).length;\n    return onBits / sdr.length;\n}\nlet density = sparsity;\n\n/*********\n UPDATE\n *********/\n\n// Flips every bit.\nfunction invert(sdr) {\n    return sdr.map(bit => {\n        if (bit === 0) return 1;\n        return 0;\n    });\n}\n\nfunction adjustTo(sdr, targetDensity) {\n    let out = sdr.slice();\n\n    let n = sdr.length;\n    let currentDensity = density(sdr);\n    let diff = targetDensity - currentDensity;\n    let diffBits = Math.abs(parseInt(diff * n));\n    let onBits = getActiveBits(sdr);\n    let offBits = getInactiveBits(sdr);\n\n    // adjust by turning bits on\n    let bitType = 1;\n    let targetIndices = offBits;\n    // adjust by turning bits off\n    if (targetDensity < currentDensity) {\n        bitType = 0;\n        targetIndices = onBits;\n    }\n\n    for (let i = 0; i < diffBits; i++) {\n        let toFlip = targetIndices.splice(getRandomInt(0, targetIndices.length - 1), 1)[0];\n        out[toFlip] = bitType;\n    }\n\n    return out;\n}\n\n// Adds a percent noise by turning on X percent of the off bits and\n// turning off X percent of the on bits.\nfunction addNoise(sdr, percentNoise) {\n    // The noiseLevel will be the number of total bits to flip.\n    let noiseLevel = Math.floor(population(sdr) * percentNoise);\n    return this.addBitNoise(sdr, noiseLevel);\n}\n\nfunction addBitNoise(sdr, noisyBits) {\n    let noisy = [];\n    let activeBits = getActiveBits(sdr);\n    let inactiveBits = getInactiveBits(sdr);\n    let toFlip = [];\n    // Populate the indices of the bits we want to flip with noise.\n    times(noisyBits, function () {\n        toFlip.push(activeBits.splice(Math.random(activeBits.length - 1), 1)[0]);\n        toFlip.push(inactiveBits.splice(Math.random(inactiveBits.length - 1), 1)[0]);\n    });\n    // Flip them bits into a new array output.\n    sdr.forEach((bit, i) => {\n        let newBit = bit;\n        if (toFlip.indexOf(i) >= 0) {\n            newBit = flip(bit);\n        }\n        noisy.push(newBit);\n    });\n    return noisy;\n}\n\nmodule.exports = {\n    getRandom: getRandom,\n    getEmpty: getEmpty,\n    getActiveBits: getActiveBits,\n    getInactiveBits: getInactiveBits,\n    population: population,\n    sparsity: sparsity,\n    density: density,\n    invert: invert,\n    addNoise: addNoise,\n    addBitNoise: addBitNoise,\n    adjustTo: adjustTo\n};\n\n//# sourceURL=webpack:///./node_modules/cell-viz/src/SdrUtils.js?");

/***/ }),

/***/ "./widgets/spatial-pooling/index.js":
/*!******************************************!*\
  !*** ./widgets/spatial-pooling/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.BHTMS = {\n    miniColumnPotentialPools: __webpack_require__(/*! ./miniColumnPotentialPools */ \"./widgets/spatial-pooling/miniColumnPotentialPools.js\"),\n    miniColumnInitialPerms: __webpack_require__(/*! ./miniColumnInitialPerms */ \"./widgets/spatial-pooling/miniColumnInitialPerms.js\")\n};\n\n//# sourceURL=webpack:///./widgets/spatial-pooling/index.js?");

/***/ }),

/***/ "./widgets/spatial-pooling/miniColumnInitialPerms.js":
/*!***********************************************************!*\
  !*** ./widgets/spatial-pooling/miniColumnInitialPerms.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let SdrUtils = __webpack_require__(/*! SdrUtils */ \"./node_modules/cell-viz/src/SdrUtils.js\");\nlet SdrDrawing = __webpack_require__(/*! SdrDrawing */ \"./node_modules/cell-viz/src/SdrDrawing.js\");\n\nmodule.exports = () => {\n    let $receptiveFieldPercSlider = $('#receptiveFieldPercSlider');\n    let $receptiveFieldPercDisplay = $('.receptiveFieldPercDisplay');\n    let $connectionThresholdSlider = $('#connectionThresholdSlider');\n    let $connectionThresholdDisplays = $('.connectionThresholdDisplay');\n    let $independentVariablesSlider = $('#independentVariablesSlider');\n    let $independentVariablesDisplays = $('.independentVariablesDisplay');\n    let $distributionCenterSlider = $('#distributionCenterSlider');\n    let $distributionCenterDisplays = $('.distributionCenterDisplay');\n    let $percConnectedDisplay = $('.percConnectedDisplay');\n    let $percConnectedInFieldDisplay = $('.percConnectedInFieldDisplay');\n    let inputSpaceDimensions = 400;\n\n    let drawOptions = {\n        width: 560,\n        rowLength: 19,\n        gradientFill: true,\n        connectionColor: 'navy'\n    };\n    let potentialPool;\n    let permanences;\n\n    function updatePermanences() {\n        let independentVariables = parseInt($independentVariablesSlider.val());\n        let distributionCenter = parseInt($distributionCenterSlider.val()) / 100;\n        permanences = d3.range(potentialPool.length).map(d3.randomBates(independentVariables)).map((val, i) => {\n            if (potentialPool[i] === 1) {\n                return val + distributionCenter - 0.5;\n            } else {\n                return null;\n            }\n        });\n    }\n\n    function updatePercentConnectedDisplay() {\n        let connected = 0;\n        let threshold = parseInt($connectionThresholdSlider.val()) / 100;\n        let receptiveFieldSize = SdrUtils.population(permanences);\n        permanences.forEach(perm => {\n            if (perm >= threshold) connected++;\n        });\n        $percConnectedDisplay.html(Math.round(connected / inputSpaceDimensions * 100));\n        $percConnectedInFieldDisplay.html(Math.round(connected / receptiveFieldSize * 100));\n    }\n\n    function updateDisplays() {\n        let connectionThreshold = parseInt($connectionThresholdSlider.val()) / 100;\n        let sdr = new SdrDrawing(permanences, 'receptiveFieldDemo');\n        drawOptions.threshold = connectionThreshold;\n        sdr.draw(drawOptions);\n        $receptiveFieldPercDisplay.html($receptiveFieldPercSlider.val());\n\n        $connectionThresholdDisplays.html(parseInt($connectionThresholdSlider.val()) / 100);\n        $independentVariablesDisplays.html($independentVariablesSlider.val());\n        $distributionCenterDisplays.html(parseInt($distributionCenterSlider.val()) / 100);\n        updatePercentConnectedDisplay();\n        drawHistogram(permanences);\n    }\n\n    function drawHistogram(rawData) {\n        let formatCount = d3.format(\",.0f\");\n        let data = rawData.filter(d => d !== null);\n\n        $('svg#receptiveFieldHistogram').html('');\n        let svg = d3.select(\"svg#receptiveFieldHistogram\");\n        margin = { top: 10, right: 30, bottom: 30, left: 30 }, width = +svg.attr(\"width\") - margin.left - margin.right, height = +svg.attr(\"height\") - margin.top - margin.bottom, g = svg.append(\"g\").attr(\"transform\", \"translate(\" + margin.left + \",\" + margin.top + \")\");\n\n        let x = d3.scaleLinear().rangeRound([0, width]);\n\n        let bins = d3.histogram().domain(x.domain()).thresholds(x.ticks(40))(data);\n\n        let y = d3.scaleLinear().domain([0, d3.max(bins, function (d) {\n            return d.length;\n        })]).range([height, 0]);\n\n        let bar = g.selectAll(\".bar\").data(bins).enter().append(\"g\").attr(\"class\", \"bar\").attr(\"transform\", function (d) {\n            return \"translate(\" + x(d.x0) + \",\" + y(d.length) + \")\";\n        });\n\n        bar.append(\"rect\").attr(\"x\", 1).attr(\"width\", x(bins[0].x1) - x(bins[0].x0) - 1).attr(\"height\", function (d) {\n            return height - y(d.length);\n        });\n\n        bar.append(\"text\").attr(\"dy\", \".75em\").attr(\"y\", 6).attr(\"x\", (x(bins[0].x1) - x(bins[0].x0)) / 2).attr(\"text-anchor\", \"middle\").text(function (d) {\n            return formatCount(d.length);\n        });\n\n        let connectionThreshold = parseInt($connectionThresholdSlider.val()) / 100;\n        g.append('line').attr('id', 'connectionThreshold').attr('x1', x(connectionThreshold)).attr('x2', x(connectionThreshold)).attr('y1', 0).attr('y2', 200).attr('stroke', 'red').attr('stroke-width', 4);\n\n        g.append(\"g\").attr(\"class\", \"axis axis--x\").attr(\"transform\", \"translate(0,\" + height + \")\").call(d3.axisBottom(x));\n    }\n\n    $connectionThresholdSlider.on('input', updateDisplays);\n\n    $independentVariablesSlider.on('input', () => {\n        updatePermanences();\n        updateDisplays();\n    });\n\n    $distributionCenterSlider.on('input', () => {\n        updatePermanences();\n        updateDisplays();\n    });\n\n    $(document).on('potentialPoolUpdate', (event, pool) => {\n        potentialPool = pool;\n        updatePermanences();\n        updateDisplays();\n    });\n};\n\n//# sourceURL=webpack:///./widgets/spatial-pooling/miniColumnInitialPerms.js?");

/***/ }),

/***/ "./widgets/spatial-pooling/miniColumnPotentialPools.js":
/*!*************************************************************!*\
  !*** ./widgets/spatial-pooling/miniColumnPotentialPools.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let SdrUtils = __webpack_require__(/*! SdrUtils */ \"./node_modules/cell-viz/src/SdrUtils.js\");\nlet SdrDrawing = __webpack_require__(/*! SdrDrawing */ \"./node_modules/cell-viz/src/SdrDrawing.js\");\n\nmodule.exports = () => {\n\n    let $receptiveFieldPercSlider = $('#receptiveFieldPercSlider');\n    let $receptiveFieldPercDisplay = $('.receptiveFieldPercDisplay');\n    let $inputSpaceSizeSlider = $('#inputSpaceSizeSlider');\n    let $inputSpaceSizeDisplay = $('.inputSpaceSizeDisplay');\n    let $miniColumnCountSlider = $('#miniColumnCountSlider');\n    let $miniColumnCountDisplay = $('.miniColumnCountDisplay');\n\n    let selectedMiniColumnIndex = 0;\n    let potentialPools = [];\n    let miniColumns = [];\n\n    let drawOptions = {\n        width: 270,\n        height: 270\n    };\n\n    function loadRandomPotentialPools() {\n        let inputSpaceDimensions = parseInt($inputSpaceSizeSlider.val());\n        let miniColumnCount = parseInt($miniColumnCountSlider.val());\n        potentialPools = [];\n        for (let i = 0; i < miniColumnCount; i++) {\n            let pool = [];\n            let receptiveFieldPerc = parseInt($receptiveFieldPercSlider.val()) / 100;\n            for (let j = 0; j < inputSpaceDimensions; j++) {\n                if (Math.random() > receptiveFieldPerc) pool.push(0);else pool.push(1);\n            }\n            potentialPools.push(pool);\n        }\n        $(document).trigger('potentialPoolUpdate', [potentialPools[selectedMiniColumnIndex], miniColumnCount]);\n    }\n\n    function updateSelectedMiniColumn(index) {\n        selectedMiniColumnIndex = index;\n        let miniColumnCount = parseInt($miniColumnCountSlider.val());\n        miniColumns = SdrUtils.getEmpty(miniColumnCount);\n        miniColumns[selectedMiniColumnIndex] = 1;\n        $(document).trigger('potentialPoolUpdate', [potentialPools[selectedMiniColumnIndex], miniColumnCount]);\n    }\n\n    function updateDisplays() {\n        let pool = potentialPools[selectedMiniColumnIndex];\n        let poolDrawing = new SdrDrawing(pool, 'inputSpacePools');\n        poolDrawing.draw(drawOptions);\n\n        let miniColumnsDrawing = new SdrDrawing(miniColumns, 'miniColumnPools');\n        let mcOpts = Object.assign({}, drawOptions);\n        mcOpts.onColor = 'khaki';\n        miniColumnsDrawing.draw(mcOpts);\n        miniColumnsDrawing.$drawing.attr('transform', 'translate(280)');\n        miniColumnsDrawing.onCell('mouseover', (d, i) => {\n            updateSelectedMiniColumn(i);\n            updateDisplays();\n        });\n\n        $receptiveFieldPercDisplay.html($receptiveFieldPercSlider.val());\n        $inputSpaceSizeDisplay.html($inputSpaceSizeSlider.val());\n        $miniColumnCountDisplay.html($miniColumnCountSlider.val());\n    }\n\n    loadRandomPotentialPools();\n    updateSelectedMiniColumn(0);\n    updateDisplays();\n\n    $('#potentialPoolWidget input').on('input', event => {\n        updateSelectedMiniColumn(selectedMiniColumnIndex);\n        loadRandomPotentialPools();\n        updateDisplays();\n        event.preventDefault();\n        event.stopPropagation();\n    });\n\n    // This allows time for other widgets to load before sharing data.\n    setTimeout(() => {\n        let miniColumnCount = parseInt($miniColumnCountSlider.val());\n        $(document).trigger('potentialPoolUpdate', [potentialPools[selectedMiniColumnIndex], miniColumnCount]);\n    }, 500);\n};\n\n//# sourceURL=webpack:///./widgets/spatial-pooling/miniColumnPotentialPools.js?");

/***/ }),

/***/ 0:
/*!**********************************************************************************************************************************************************!*\
  !*** multi ./widgets/spatial-pooling/miniColumnPotentialPools.js ./widgets/spatial-pooling/miniColumnInitialPerms.js ./widgets/spatial-pooling/index.js ***!
  \**********************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./widgets/spatial-pooling/miniColumnPotentialPools.js */\"./widgets/spatial-pooling/miniColumnPotentialPools.js\");\n__webpack_require__(/*! ./widgets/spatial-pooling/miniColumnInitialPerms.js */\"./widgets/spatial-pooling/miniColumnInitialPerms.js\");\nmodule.exports = __webpack_require__(/*! ./widgets/spatial-pooling/index.js */\"./widgets/spatial-pooling/index.js\");\n\n\n//# sourceURL=webpack:///multi_./widgets/spatial-pooling/miniColumnPotentialPools.js_./widgets/spatial-pooling/miniColumnInitialPerms.js_./widgets/spatial-pooling/index.js?");

/***/ })

/******/ });