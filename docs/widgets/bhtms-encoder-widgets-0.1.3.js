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

/***/ "./node_modules/cell-viz/src/SdrUtils.js":
/*!***********************************************!*\
  !*** ./node_modules/cell-viz/src/SdrUtils.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let DEFAULT_SPARSITY = 0.02;\n\n/***** Private TOOLS *****/\n\n// a tool to loop x times\nfunction times(count, fn) {\n    for (let i = 0; i < count; i++) {\n        fn(i);\n    }\n}\n\nfunction getRandomInt(min, max) {\n    return Math.floor(Math.random() * (max - min)) + min;\n}\n\nfunction flip(bit) {\n    if (bit === 0) return 1;\n    return 0;\n}\n\nfunction overflowSafeUniqueness(n, w) {\n    let bigN = math.bignumber(n);\n    let bigW = math.bignumber(w);\n\n    let nf = math.factorial(bigN);\n    let wf = math.factorial(bigW);\n    let nwf = math.factorial(math.subtract(bigN, bigW));\n\n    return math.divide(nf, math.multiply(wf, nwf));\n}\n\nfunction closeEnoughSparsity(a, b) {\n    let diff = Math.abs(a - b);\n    // Close enough if within one percent.\n    return diff <= 0.01;\n}\n\n/***** PUBLIC functions start here *****/\n\n/*********\n CREATE\n*********/\n\nfunction getRandom(n, w) {\n    let out = [];\n    let randomIndex;\n    let sparsity;\n\n    if (w === undefined) {\n        w = n * DEFAULT_SPARSITY;\n    }\n\n    sparsity = w / n;\n\n    // Fill array with zeros.\n    while (out.length < n) {\n        out.push(0);\n    }\n    // If not sparse enough, randomly flip 0 bits to 1.\n    while (population(out) / n < sparsity) {\n        // Make a random 0 bit into a 1.\n        randomIndex = getRandomInt(0, n);\n        if (out[randomIndex] === 0) {\n            out[randomIndex] = 1;\n        }\n    }\n\n    return out;\n}\n\nfunction getEmpty(n) {\n    let out = [];\n\n    times(n, function () {\n        out.push(0);\n    });\n    return out;\n}\n\n/*********\n INSPECT\n *********/\n\nfunction getActiveBits(sdr) {\n    let active = [];\n    sdr.forEach((bit, i) => {\n        if (bit === 1) active.push(i);\n    });\n    return active;\n}\n\nfunction getInactiveBits(sdr) {\n    let inactive = [];\n    sdr.forEach((bit, i) => {\n        if (bit === 0) inactive.push(i);\n    });\n    return inactive;\n}\n\n// This works on arrays of 0/1 and floats (assuming any value > = converts to 1).\nfunction population(sdr) {\n    return sdr.reduce(function (sum, n) {\n        let val = 0;\n        if (n > 0) val = 1;\n        return sum + val;\n    }, 0);\n}\n\nfunction sparsity(sdr) {\n    let onBits = sdr.filter(bit => {\n        return bit === 1;\n    }).length;\n    return onBits / sdr.length;\n}\nlet density = sparsity;\n\n/*********\n UPDATE\n *********/\n\n// Flips every bit.\nfunction invert(sdr) {\n    return sdr.map(bit => {\n        if (bit === 0) return 1;\n        return 0;\n    });\n}\n\nfunction adjustTo(sdr, targetDensity) {\n    let out = sdr.slice();\n\n    let n = sdr.length;\n    let currentDensity = density(sdr);\n    let diff = targetDensity - currentDensity;\n    let diffBits = Math.abs(parseInt(diff * n));\n    let onBits = getActiveBits(sdr);\n    let offBits = getInactiveBits(sdr);\n\n    // adjust by turning bits on\n    let bitType = 1;\n    let targetIndices = offBits;\n    // adjust by turning bits off\n    if (targetDensity < currentDensity) {\n        bitType = 0;\n        targetIndices = onBits;\n    }\n\n    for (let i = 0; i < diffBits; i++) {\n        let toFlip = targetIndices.splice(getRandomInt(0, targetIndices.length - 1), 1)[0];\n        out[toFlip] = bitType;\n    }\n\n    return out;\n}\n\n// Adds a percent noise by turning on X percent of the off bits and\n// turning off X percent of the on bits.\nfunction addNoise(sdr, percentNoise) {\n    // The noiseLevel will be the number of total bits to flip.\n    let noiseLevel = Math.floor(population(sdr) * percentNoise);\n    return this.addBitNoise(sdr, noiseLevel);\n}\n\nfunction addBitNoise(sdr, noisyBits) {\n    let noisy = [];\n    let activeBits = getActiveBits(sdr);\n    let inactiveBits = getInactiveBits(sdr);\n    let toFlip = [];\n    // Populate the indices of the bits we want to flip with noise.\n    times(noisyBits, function () {\n        toFlip.push(activeBits.splice(Math.random(activeBits.length - 1), 1)[0]);\n        toFlip.push(inactiveBits.splice(Math.random(inactiveBits.length - 1), 1)[0]);\n    });\n    // Flip them bits into a new array output.\n    sdr.forEach((bit, i) => {\n        let newBit = bit;\n        if (toFlip.indexOf(i) >= 0) {\n            newBit = flip(bit);\n        }\n        noisy.push(newBit);\n    });\n    return noisy;\n}\n\nmodule.exports = {\n    getRandom: getRandom,\n    getEmpty: getEmpty,\n    getActiveBits: getActiveBits,\n    getInactiveBits: getInactiveBits,\n    population: population,\n    sparsity: sparsity,\n    density: density,\n    invert: invert,\n    addNoise: addNoise,\n    addBitNoise: addBitNoise,\n    adjustTo: adjustTo\n};\n\n//# sourceURL=webpack:///./node_modules/cell-viz/src/SdrUtils.js?");

/***/ }),

/***/ "./src/widgets/encoders/numbers/index.js":
/*!***********************************************!*\
  !*** ./src/widgets/encoders/numbers/index.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.BHTMS = {\n    simpleNumberEncoder: __webpack_require__(/*! ./simpleNumberEncoder */ \"./src/widgets/encoders/numbers/simpleNumberEncoder.js\")\n};\n\n//# sourceURL=webpack:///./src/widgets/encoders/numbers/index.js?");

/***/ }),

/***/ "./src/widgets/encoders/numbers/simpleNumberEncoder.js":
/*!*************************************************************!*\
  !*** ./src/widgets/encoders/numbers/simpleNumberEncoder.js ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let SdrUtils = __webpack_require__(/*! SdrUtils */ \"./node_modules/cell-viz/src/SdrUtils.js\");\nlet utils = __webpack_require__(/*! ../../utils */ \"./src/widgets/utils.js\");\nlet html = __webpack_require__(/*! ./simpleNumberEncoder.tmpl.html */ \"./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html\");\n\nmodule.exports = elementId => {\n\n    utils.loadHtml(html.default, elementId, () => {\n\n        let width = 560,\n            height = 300,\n            minValue = 0,\n            maxValue = 55,\n            bits = 100,\n            range = 5;\n\n        let axisPadding = 30;\n\n        let $svg = d3.select('#' + elementId).select('svg').attr('width', width).attr('height', height);\n\n        function updateOutputBits(encoding) {}\n\n        function updateValue(value, min, max, maxWidth) {\n            let x = axisPadding,\n                y = 0;\n            let axisScale = d3.scaleLinear().domain([min, max]).range([0, width]);\n\n            let markerWidth = 10;\n            markerHeight = 30;\n\n            $svg.select('rect.value').attr('stroke', 'red').attr('stroke-width', 1.5).attr('fill', 'none').attr('width', markerWidth).attr('height', markerHeight).attr('x', axisScale(value) - markerWidth / 2).attr('y', axisPadding - markerHeight / 2).attr('transform', 'translate(' + x + ',' + y + ')');\n        }\n\n        function updateDisplays(encoding, value) {\n            updateOutputBits(encoding);\n            updateValue(value, minValue, maxValue, width - axisPadding * 2);\n        }\n\n        function encodeValue(v, n, w) {\n            return SdrUtils.getRandom(n, w);\n        }\n\n        function encode(value) {\n            let encoding = encodeValue(value, bits);\n            updateDisplays(encoding, value);\n        }\n\n        function setUpValueAxis(min, max, maxWidth) {\n            let width = maxWidth - axisPadding * 2;\n            let x = axisPadding,\n                y = axisPadding;\n            let axisScale = d3.scaleLinear().domain([min, max]).range([0, width]);\n            let xAxis = d3.axisBottom(axisScale);\n            $svg.append('g').attr('transform', 'translate(' + x + ',' + y + ')').call(xAxis);\n        }\n\n        setUpValueAxis(minValue, maxValue, width);\n\n        setInterval(function () {\n            let value = utils.getRandomInt(maxValue);\n            encode(value);\n        }, 1000);\n    });\n};\n\n//# sourceURL=webpack:///./src/widgets/encoders/numbers/simpleNumberEncoder.js?");

/***/ }),

/***/ "./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html":
/*!********************************************************************!*\
  !*** ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (`<svg>\n    <rect class=\"value\"></rect>\n</svg>\n\n\n`);\n\n//# sourceURL=webpack:///./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html?");

/***/ }),

/***/ "./src/widgets/utils.js":
/*!******************************!*\
  !*** ./src/widgets/utils.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Loads given html into an element, calls the cb one time when loaded.\nfunction loadHtml(html, elementId, cb) {\n    let $el = $('#' + elementId);\n    $el.one('DOMNodeInserted', cb);\n    $el.html(html);\n}\n\nfunction getRandomInt(max) {\n    return Math.floor(Math.random() * Math.floor(max));\n}\n\nmodule.exports = {\n    loadHtml: loadHtml,\n    getRandomInt: getRandomInt\n};\n\n//# sourceURL=webpack:///./src/widgets/utils.js?");

/***/ }),

/***/ 0:
/*!************************************************************************************************************************************************************************!*\
  !*** multi ./src/widgets/encoders/numbers/index.js ./src/widgets/encoders/numbers/simpleNumberEncoder.js ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html ***!
  \************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./src/widgets/encoders/numbers/index.js */\"./src/widgets/encoders/numbers/index.js\");\n__webpack_require__(/*! ./src/widgets/encoders/numbers/simpleNumberEncoder.js */\"./src/widgets/encoders/numbers/simpleNumberEncoder.js\");\nmodule.exports = __webpack_require__(/*! ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html */\"./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html\");\n\n\n//# sourceURL=webpack:///multi_./src/widgets/encoders/numbers/index.js_./src/widgets/encoders/numbers/simpleNumberEncoder.js_./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html?");

/***/ })

/******/ });