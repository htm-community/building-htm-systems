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

/***/ "./node_modules/cell-viz/src/ReceptiveField.js":
/*!*****************************************************!*\
  !*** ./node_modules/cell-viz/src/ReceptiveField.js ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let defaultOpts = {\n    width: 400,\n    height: 400,\n    cellSize: 10,\n    rowLength: 100\n};\n\nfunction ReceptiveField(bits, element) {\n    this.bits = bits;\n    this.el = element;\n}\n\nReceptiveField.prototype.draw = function (options) {\n    let sdrId = this.el;\n    let opts = Object.assign(defaultOpts, options);\n    let svg = d3.select('#' + this.el).attr('width', opts.width).attr('height', opts.height);\n\n    function treatCells(cells) {\n        cells.attr('id', (d, i) => {\n            return sdrId + '-' + i;\n        }).attr('fill', d => {\n            if (d === 1) return 'steelblue';\n            return 'white';\n        }).attr('stroke', 'darkgrey').attr('stroke-width', 0.5).attr('fill-opacity', 1).attr('x', function (d, i) {\n            let offset = i % opts.rowLength;\n            return offset * opts.cellSize;\n        }).attr('y', function (d, i) {\n            let offset = Math.floor(i / opts.rowLength);\n            return offset * opts.cellSize;\n        }).attr('width', opts.cellSize).attr('height', opts.cellSize);\n        cells.append('circle').attr('cx', (d, i) => {\n            let offset = i % opts.rowLength;\n            return offset * opts.cellSize;\n        }).attr('cy', function (d, i) {\n            let offset = Math.floor(i / opts.rowLength);\n            return offset * opts.cellSize;\n        }).attr('r', 10);\n    }\n\n    // Update\n    let rectCells = svg.selectAll('rect').data(this.bits);\n    treatCells(rectCells);\n\n    // Enter\n    let newRectCells = rectCells.enter().append('rect');\n    treatCells(newRectCells);\n\n    // Exit\n    rectCells.exit().remove();\n};\n\nmodule.exports = ReceptiveField;\n\n//# sourceURL=webpack:///./node_modules/cell-viz/src/ReceptiveField.js?");

/***/ }),

/***/ "./node_modules/cell-viz/src/SdrUtils.js":
/*!***********************************************!*\
  !*** ./node_modules/cell-viz/src/SdrUtils.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let DEFAULT_SPARSITY = 0.02;\n\n/***** Private TOOLS *****/\n\n// a tool to loop x times\nconst times = x => f => {\n    if (x > 0) {\n        f();\n        times(x - 1)(f);\n    }\n};\n\nfunction getRandomInt(min, max) {\n    return Math.floor(Math.random() * (max - min)) + min;\n}\n\nfunction flip(bit) {\n    if (bit === 0) return 1;\n    return 0;\n}\n\nfunction overflowSafeUniqueness(n, w) {\n    let bigN = math.bignumber(n);\n    let bigW = math.bignumber(w);\n\n    let nf = math.factorial(bigN);\n    let wf = math.factorial(bigW);\n    let nwf = math.factorial(math.subtract(bigN, bigW));\n\n    return math.divide(nf, math.multiply(wf, nwf));\n}\n\nfunction closeEnoughSparsity(a, b) {\n    let diff = Math.abs(a - b);\n    // Close enough if within one percent.\n    return diff <= 0.01;\n}\n\n/***** PUBLIC functions start here *****/\n\n/*********\n CREATE\n*********/\n\nfunction getRandom(n, w) {\n    let out = [];\n    let randomIndex;\n    let sparsity;\n\n    if (w === undefined) {\n        w = n * DEFAULT_SPARSITY;\n    }\n\n    sparsity = w / n;\n\n    // Fill array with zeros.\n    while (out.length < n) {\n        out.push(0);\n    }\n    // If not sparse enough, randomly flip 0 bits to 1.\n    while (population(out) / n < sparsity) {\n        // Make a random 0 bit into a 1.\n        randomIndex = getRandomInt(0, n);\n        if (out[randomIndex] === 0) {\n            out[randomIndex] = 1;\n        }\n    }\n\n    return out;\n}\n\nfunction getEmpty(n) {\n    let out = [];\n\n    times(n, function () {\n        out.push(0);\n    });\n    return out;\n}\n\n/*********\n INSPECT\n *********/\n\nfunction getActiveBits(sdr) {\n    let active = [];\n    sdr.forEach((bit, i) => {\n        if (bit === 1) active.push(i);\n    });\n    return active;\n}\n\nfunction getInactiveBits(sdr) {\n    let inactive = [];\n    sdr.forEach((bit, i) => {\n        if (bit === 0) inactive.push(i);\n    });\n    return inactive;\n}\n\nfunction population(sdr) {\n    return sdr.reduce(function (sum, n) {\n        return sum + n;\n    }, 0);\n}\n\nfunction sparsity(sdr) {\n    let onBits = sdr.filter(bit => {\n        return bit === 1;\n    }).length;\n    return onBits / sdr.length;\n}\nlet density = sparsity;\n\n/*********\n UPDATE\n *********/\n\n// Flips every bit.\nfunction invert(sdr) {\n    return sdr.map(bit => {\n        if (bit === 0) return 1;\n        return 0;\n    });\n}\n\nfunction adjustTo(sdr, targetDensity) {\n    let out = sdr.slice();\n\n    let n = sdr.length;\n    let currentDensity = density(sdr);\n    let diff = targetDensity - currentDensity;\n    let diffBits = Math.abs(parseInt(diff * n));\n    let onBits = getActiveBits(sdr);\n    let offBits = getInactiveBits(sdr);\n\n    // adjust by turning bits on\n    let bitType = 1;\n    let targetIndices = offBits;\n    // adjust by turning bits off\n    if (targetDensity < currentDensity) {\n        bitType = 0;\n        targetIndices = onBits;\n    }\n\n    for (let i = 0; i < diffBits; i++) {\n        let toFlip = targetIndices.splice(getRandomInt(0, targetIndices.length - 1), 1)[0];\n        out[toFlip] = bitType;\n    }\n\n    return out;\n}\n\n// Adds a percent noise by turning on X percent of the off bits and\n// turning off X percent of the on bits.\nfunction addNoise(sdr, percentNoise) {\n    // The noiseLevel will be the number of total bits to flip.\n    let noiseLevel = Math.floor(population(sdr) * percentNoise);\n    return this.addBitNoise(sdr, noiseLevel);\n}\n\nfunction addBitNoise(sdr, noisyBits) {\n    let noisy = [];\n    let activeBits = getActiveBits(sdr);\n    let inactiveBits = getInactiveBits(sdr);\n    let toFlip = [];\n    // Populate the indices of the bits we want to flip with noise.\n    times(noisyBits, function () {\n        toFlip.push(activeBits.splice(Math.random(activeBits.length - 1), 1)[0]);\n        toFlip.push(inactiveBits.splice(Math.random(inactiveBits.length - 1), 1)[0]);\n    });\n    // Flip them bits into a new array output.\n    sdr.forEach((bit, i) => {\n        let newBit = bit;\n        if (toFlip.indexOf(i) >= 0) {\n            newBit = flip(bit);\n        }\n        noisy.push(newBit);\n    });\n    return noisy;\n}\n\nmodule.exports = {\n    getRandom: getRandom,\n    getEmpty: getEmpty,\n    getActiveBits: getActiveBits,\n    getInactiveBits: getInactiveBits,\n    population: population,\n    sparsity: sparsity,\n    density: density,\n    invert: invert,\n    addNoise: addNoise,\n    addBitNoise: addBitNoise,\n    adjustTo: adjustTo\n};\n\n//# sourceURL=webpack:///./node_modules/cell-viz/src/SdrUtils.js?");

/***/ }),

/***/ "./widgets/spatial-pooling/index.js":
/*!******************************************!*\
  !*** ./widgets/spatial-pooling/index.js ***!
  \******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.BHTMS = {\n    receptiveField: __webpack_require__(/*! ./receptive-field */ \"./widgets/spatial-pooling/receptive-field.js\"),\n    receptiveFieldHistogram: __webpack_require__(/*! ./receptive-field-histogram */ \"./widgets/spatial-pooling/receptive-field-histogram.js\")\n};\n\n//# sourceURL=webpack:///./widgets/spatial-pooling/index.js?");

/***/ }),

/***/ "./widgets/spatial-pooling/receptive-field-histogram.js":
/*!**************************************************************!*\
  !*** ./widgets/spatial-pooling/receptive-field-histogram.js ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let SdrUtils = __webpack_require__(/*! SdrUtils */ \"./node_modules/cell-viz/src/SdrUtils.js\");\nlet ReceptiveField = __webpack_require__(/*! ReceptiveField */ \"./node_modules/cell-viz/src/ReceptiveField.js\");\n\nmodule.exports = () => {\n\n    let $connectionThresholdSlider = $('#connectionThresholdSlider');\n    let $connectionThresholdDisplays = $('.connectionThresholdDisplay');\n    let $independentVariablesSlider = $('#independentVariablesSlider');\n    let $independentVariablesDisplays = $('.independentVariablesDisplay');\n    let $inputSpaceDimensionsSlider = $('#inputSpaceDimensionsSlider');\n    let $distributionCenterSlider = $('#distributionCenterSlider');\n    let $distributionCenterDisplays = $('.distributionCenterDisplay');\n    let $percConnectedDisplay = $('.percConnectedDisplay');\n    let $percConnectedInFieldDisplay = $('.percConnectedInFieldDisplay');\n\n    let permanences;\n    let connections;\n\n    function updatePermanences() {\n        let pool = localStorage.getItem('currentPotentialPool').split(',').map(m => parseInt(m));\n        let poolIndices = SdrUtils.getActiveBits(pool);\n        let independentVariables = parseInt($independentVariablesSlider.val());\n        let distributionCenter = parseInt($distributionCenterSlider.val()) / 100;\n        let threshold = parseInt($connectionThresholdSlider.val()) / 100;\n        permanences = d3.range(poolIndices.length).map(d3.randomBates(independentVariables)).map(input => {\n            return input + distributionCenter - 0.5;\n        });\n        localStorage.setItem('permanences', permanences);\n        connections = permanences.map(perm => {\n            if (perm > threshold) return 1;\n            return 0;\n        });\n        localStorage.setItem('connections', connections);\n    }\n\n    function updatePercentConnectedDisplay() {\n        let connected = 0;\n        let threshold = parseInt($connectionThresholdSlider.val()) / 100;\n        let inputSpaceDimensions = parseInt($inputSpaceDimensionsSlider.val());\n        let receptiveFieldSize = permanences.length;\n        permanences.forEach(perm => {\n            if (perm >= threshold) connected++;\n        });\n        $percConnectedDisplay.html(Math.round(connected / inputSpaceDimensions * 100));\n        $percConnectedInFieldDisplay.html(Math.round(connected / receptiveFieldSize * 100));\n    }\n\n    function updateDisplays() {\n        $connectionThresholdDisplays.html(parseInt($connectionThresholdSlider.val()) / 100);\n        $independentVariablesDisplays.html($independentVariablesSlider.val());\n        $distributionCenterDisplays.html(parseInt($distributionCenterSlider.val()) / 100);\n        updatePercentConnectedDisplay();\n        drawHistogram(permanences);\n    }\n\n    function drawHistogram(data) {\n        let formatCount = d3.format(\",.0f\");\n\n        $('svg#receptiveFieldHistogram').html('');\n        let svg = d3.select(\"svg#receptiveFieldHistogram\");\n        margin = { top: 10, right: 30, bottom: 30, left: 30 }, width = +svg.attr(\"width\") - margin.left - margin.right, height = +svg.attr(\"height\") - margin.top - margin.bottom, g = svg.append(\"g\").attr(\"transform\", \"translate(\" + margin.left + \",\" + margin.top + \")\");\n\n        let x = d3.scaleLinear().rangeRound([0, width]);\n\n        let bins = d3.histogram().domain(x.domain()).thresholds(x.ticks(40))(data);\n\n        let y = d3.scaleLinear().domain([0, d3.max(bins, function (d) {\n            return d.length;\n        })]).range([height, 0]);\n\n        let bar = g.selectAll(\".bar\").data(bins).enter().append(\"g\").attr(\"class\", \"bar\").attr(\"transform\", function (d) {\n            return \"translate(\" + x(d.x0) + \",\" + y(d.length) + \")\";\n        });\n\n        bar.append(\"rect\").attr(\"x\", 1).attr(\"width\", x(bins[0].x1) - x(bins[0].x0) - 1).attr(\"height\", function (d) {\n            return height - y(d.length);\n        });\n\n        bar.append(\"text\").attr(\"dy\", \".75em\").attr(\"y\", 6).attr(\"x\", (x(bins[0].x1) - x(bins[0].x0)) / 2).attr(\"text-anchor\", \"middle\").text(function (d) {\n            return formatCount(d.length);\n        });\n\n        let connectionThreshold = parseInt($connectionThresholdSlider.val()) / 100;\n        g.append('line').attr('id', 'connectionThreshold').attr('x1', x(connectionThreshold)).attr('x2', x(connectionThreshold)).attr('y1', 0).attr('y2', 200).attr('stroke', 'red').attr('stroke-width', 4);\n        // let connectionThresholdLine = svg.selectAll('#connectionThreshold')\n        //     .data(connectionThreshold)\n        //     .enter().append('line')\n        //     .attr('id', 'connectionThreshold')\n        //     .attr('x1', (d) => d)\n        //     .attr('x2', (d) => d)\n        //     .attr('y1', 10)\n        //     .attr('y2', 100)\n\n        g.append(\"g\").attr(\"class\", \"axis axis--x\").attr(\"transform\", \"translate(0,\" + height + \")\").call(d3.axisBottom(x));\n    }\n\n    function redraw() {\n        updatePermanences();\n        updateDisplays();\n    }\n\n    $independentVariablesSlider.on('input', redraw);\n    $inputSpaceDimensionsSlider.on('input', redraw);\n    $distributionCenterSlider.on('input', redraw);\n    $('#receptiveFieldPercSlider').on('input', redraw);\n\n    $connectionThresholdSlider.on('input', () => {\n        // We don't need to update permanences just to redraw the connection threshold line.\n        updateDisplays();\n    });\n\n    updatePermanences();\n    drawHistogram(permanences);\n    updateDisplays();\n};\n\n//# sourceURL=webpack:///./widgets/spatial-pooling/receptive-field-histogram.js?");

/***/ }),

/***/ "./widgets/spatial-pooling/receptive-field.js":
/*!****************************************************!*\
  !*** ./widgets/spatial-pooling/receptive-field.js ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let SdrUtils = __webpack_require__(/*! SdrUtils */ \"./node_modules/cell-viz/src/SdrUtils.js\");\nlet ReceptiveField = __webpack_require__(/*! ReceptiveField */ \"./node_modules/cell-viz/src/ReceptiveField.js\");\n\nmodule.exports = () => {\n    let $receptiveFieldPercSlider = $('#receptiveFieldPercSlider');\n    let $receptiveFieldPercDisplay = $('.receptiveFieldPercDisplay');\n    let $inputSpaceDimensionsSlider = $('#inputSpaceDimensionsSlider');\n    let $inputSpaceDimensionsDisplay = $('.inputSpaceDimensionsDisplay');\n\n    function getRandomReceptiveField(receptiveFieldPerc, dimensions) {\n        let n = dimensions;\n        let w = parseInt(receptiveFieldPerc * n);\n        let potentialPool = SdrUtils.getRandom(n, w);\n        return potentialPool;\n    }\n\n    let drawOptions = {\n        width: 600,\n        height: 310,\n        cellSize: 20,\n        rowLength: 28\n    };\n\n    function updateDisplays() {\n        sdr.draw(drawOptions);\n        $receptiveFieldPercDisplay.html($receptiveFieldPercSlider.val());\n        $inputSpaceDimensionsDisplay.html($inputSpaceDimensionsSlider.val());\n    }\n\n    $receptiveFieldPercSlider.on('input', function () {\n        let targetDensity = parseInt(this.value) / 100;\n        pool = SdrUtils.adjustTo(pool, targetDensity);\n        localStorage.setItem('currentPotentialPool', pool);\n        sdr = new ReceptiveField(pool, 'receptiveFieldDemo');\n        updateDisplays();\n    });\n\n    $inputSpaceDimensionsSlider.on('input', function () {\n        pool = getRandomReceptiveField(parseInt($receptiveFieldPercSlider.val()) / 100, parseFloat($inputSpaceDimensionsSlider.val()));\n        localStorage.setItem('currentPotentialPool', pool);\n        sdr = new ReceptiveField({ bits }, 'receptiveFieldDemo');\n        updateDisplays();\n    });\n\n    let pool = getRandomReceptiveField(parseInt($receptiveFieldPercSlider.val()) / 100, parseFloat($inputSpaceDimensionsSlider.val()));\n    localStorage.setItem('currentPotentialPool', pool);\n    let sdr = new ReceptiveField(pool, 'receptiveFieldDemo');\n    updateDisplays();\n};\n\n//# sourceURL=webpack:///./widgets/spatial-pooling/receptive-field.js?");

/***/ }),

/***/ 0:
/*!****************************************************************************************************************************************************!*\
  !*** multi ./widgets/spatial-pooling/receptive-field.js ./widgets/spatial-pooling/receptive-field-histogram.js ./widgets/spatial-pooling/index.js ***!
  \****************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./widgets/spatial-pooling/receptive-field.js */\"./widgets/spatial-pooling/receptive-field.js\");\n__webpack_require__(/*! ./widgets/spatial-pooling/receptive-field-histogram.js */\"./widgets/spatial-pooling/receptive-field-histogram.js\");\nmodule.exports = __webpack_require__(/*! ./widgets/spatial-pooling/index.js */\"./widgets/spatial-pooling/index.js\");\n\n\n//# sourceURL=webpack:///multi_./widgets/spatial-pooling/receptive-field.js_./widgets/spatial-pooling/receptive-field-histogram.js_./widgets/spatial-pooling/index.js?");

/***/ })

/******/ });