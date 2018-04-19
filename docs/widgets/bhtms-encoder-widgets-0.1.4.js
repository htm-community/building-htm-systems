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

/***/ "./src/htm/encoders/relativeScalarEncoder.js":
/*!***************************************************!*\
  !*** ./src/htm/encoders/relativeScalarEncoder.js ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class RelativeScalarEncoder {\n\n    constructor(n, resolution, min, max) {\n        this.n = n;\n        this.resolution = resolution;\n        this.min = min;\n        this.max = max;\n        this.range = max - min;\n        this._bitIndexToValue = d3.scaleLinear().domain([0, n]).range([min, max]);\n    }\n\n    encode(value) {\n        let encoding = [],\n            resolution = this.resolution,\n            n = this.n,\n            max = this.max;\n        for (let i = 0; i < n; i++) {\n            let bitValue = this._bitIndexToValue(i),\n                bit = 0,\n                valueDiff = bitValue - value,\n                valueDistance = Math.abs(valueDiff),\n                radius = resolution / 2;\n            if (valueDistance <= radius) bit = 1;\n            // Keeps the bucket from changing size at min/max values\n            if (value < radius && bitValue < resolution) bit = 1;\n            if (value > max - radius && bitValue > max - resolution) bit = 1;\n            encoding.push(bit);\n        }\n        return encoding;\n    }\n\n    getRangeFromBitIndex(i) {\n        let v = this._bitIndexToValue(i),\n            res = this.resolution,\n            max = this.max,\n            radius = res / 2,\n            left = Math.max(this.min, v - radius),\n            right = Math.min(this.max, v + radius);\n        // Keeps the bucket from changing size at min/max values\n        if (left < radius) left = 0;\n        if (right > max - radius) right = max;\n        return [left, right];\n    }\n\n}\n\nmodule.exports = RelativeScalarEncoder;\n\n//# sourceURL=webpack:///./src/htm/encoders/relativeScalarEncoder.js?");

/***/ }),

/***/ "./src/htm/encoders/scalar.js":
/*!************************************!*\
  !*** ./src/htm/encoders/scalar.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class ScalarEncoder {\n\n    constructor(n, w, min, max) {\n        this.n = n;\n        this.resolution = w;\n        this.numBuckets = n - w + 1;\n        this.range = max - min;\n        this.min = min;\n        this.max = max;\n        this._valueToBitIndex = d3.scaleLinear().domain([0, this.n]).range([min, max]);\n        this.sparsity = w / n;\n    }\n\n    encode(input) {\n        let output = [];\n        let firstBit;\n        let min = this.min;\n        firstBit = Math.floor(this.numBuckets * (input - min) / this.range);\n        for (let i = 0; i < this.n; i++) {\n            output.push(0);\n        }\n        for (let i = 0; i < this.resolution; i++) {\n            if (firstBit + i < output.length) output[firstBit + i] = 1;\n        }\n        return output;\n    }\n\n    getRangeFromBitIndex(i) {\n        let value = this._valueToBitIndex(i);\n        let start = value - this.max * this.sparsity / 2;\n        let end = value + this.max * this.sparsity / 2;\n        let out = [];\n        out.push(start);\n        out.push(end);\n        return out;\n    }\n}\n\nfunction PeriodicScalarEncoder(n, w, radius, minValue, maxValue) {\n    let neededBuckets;\n    // Distribute nBuckets points along the domain [minValue, maxValue],\n    // including the endpoints. The resolution is the width of each band\n    // between the points.\n\n    if (!n && !radius || n && radius) {\n        throw new Error('Exactly one of n / radius must be defined.');\n    }\n\n    this.resolution = w;\n    this.radius = radius;\n    this.minValue = minValue;\n    this.maxValue = maxValue;\n\n    this.range = maxValue - minValue;\n\n    if (n) {\n        this.n = n;\n        this.radius = this.resolution * (this.range / this.n);\n        this.bucketWidth = this.range / this.n;\n    } else {\n        this.bucketWidth = this.radius / this.resolution;\n        neededBuckets = Math.ceil(this.range / this.bucketWidth);\n        if (neededBuckets > this.resolution) {\n            this.n = neededBuckets;\n        } else {\n            this.n = this.resolution + 1;\n        }\n    }\n}\n\nPeriodicScalarEncoder.prototype.getWidth = function () {\n    return this.n;\n};\n\nPeriodicScalarEncoder.prototype.encode = function (input) {\n    let output = [];\n    let i, index;\n    let iBucket = Math.floor((input - this.minValue) / this.bucketWidth);\n    let middleBit = iBucket;\n    let reach = (this.resolution - 1) / 2.0;\n    let left = Math.floor(reach);\n    let right = Math.ceil(reach);\n\n    if (input < this.minValue || input >= this.maxValue) {\n        throw Error('Input out of bounds: ' + input);\n    }\n\n    for (let i = 0; i < this.n; i++) {\n        output.push(0);\n    }\n\n    output[middleBit] = 1;\n\n    for (i = 1; i <= left; i++) {\n        index = middleBit - 1;\n        if (index < 0) {\n            index = index + this.n;\n        }\n        if (index > this.n) {\n            throw Error('out of bounds');\n        }\n        output[index] = 1;\n    }\n    for (i = 1; i <= right; i++) {\n        if ((middleBit + i) % this.n > this.n) {\n            throw Error('out of bounds');\n        }\n        output[(middleBit + i) % this.n] = 1;\n    }\n    return output;\n};\n\nmodule.exports = {\n    ScalarEncoder: ScalarEncoder,\n    PeriodicScalarEncoder: PeriodicScalarEncoder\n};\n\n//# sourceURL=webpack:///./src/htm/encoders/scalar.js?");

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

eval("let RelativeScalarEncoder = __webpack_require__(/*! ../../../htm/encoders/relativeScalarEncoder */ \"./src/htm/encoders/relativeScalarEncoder.js\");\nlet ScalarEncoder = __webpack_require__(/*! ../../../htm/encoders/scalar */ \"./src/htm/encoders/scalar.js\").ScalarEncoder;\nlet utils = __webpack_require__(/*! ../../utils */ \"./src/widgets/utils.js\");\nlet html = __webpack_require__(/*! ./simpleNumberEncoder.tmpl.html */ \"./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html\");\n\nconst onColor = 'skyblue';\nconst offColor = 'white';\n\nmodule.exports = elementId => {\n\n    utils.loadHtml(html.default, elementId, () => {\n\n        let width = 560,\n            height = 200,\n            minValue = 0,\n            maxValue = 55,\n            bits = 100,\n            value = 30;\n\n        let valueScaleTopMargin = 40,\n            valueScaleSideMargins = 10;\n\n        let $resolutionSlider = $('#resolutionSlider'),\n            $valueDisplays = $('.valueDisplay'),\n            $resolutionDisplays = $('.resolutionDisplay');\n\n        let resolution = parseInt(parseInt($resolutionSlider.val()) / 100);\n\n        let $svg = d3.select('#' + elementId).select('svg').attr('width', width).attr('height', height);\n\n        let valueToX;\n        let xToValue;\n\n        let encoder;\n\n        function updateOutputBits(encoding, maxWidth) {\n            let topMargin = 120;\n            let padding = 30;\n            let bits = encoding.length;\n            let width = maxWidth - padding * 2;\n            let bitsToOutputDisplay = d3.scaleLinear().domain([0, bits]).range([0, width]);\n            let cellWidth = Math.floor(width / bits);\n            let $outputGroup = $svg.select('g.encoding');\n            let $hoverGroup = $svg.select('g.range');\n\n            function treatCellRects(r) {\n                r.attr('class', 'bit').attr('fill', d => {\n                    if (d) return onColor;else return offColor;\n                }).attr('stroke', 'darkgrey').attr('stroke-width', 0.5).attr('fill-opacity', 1).attr('x', function (d, i) {\n                    return bitsToOutputDisplay(i);\n                }).attr('y', padding).attr('width', cellWidth).attr('height', cellWidth * 4);\n            }\n\n            // Update\n            let rects = $outputGroup.selectAll('rect.bit').data(encoding);\n            treatCellRects(rects);\n\n            // Enter\n            let newRects = rects.enter().append('rect');\n            treatCellRects(newRects);\n\n            // Exit\n            rects.exit().remove();\n\n            $outputGroup.attr('transform', 'translate(' + padding + ',' + topMargin + ')');\n\n            rects = $outputGroup.selectAll('rect.bit');\n\n            let lineFunction = d3.line().x(function (d) {\n                return d.x;\n            }).y(function (d) {\n                return d.y;\n            }).curve(d3.curveCatmullRom.alpha(0.5));\n            rects.on('mouseenter', (bit, index) => {\n                let cx = padding + bitsToOutputDisplay(index) + cellWidth / 2;\n                let cy = topMargin + 30;\n                let valueRange = encoder.getRangeFromBitIndex(index);\n                // Circle point\n                $hoverGroup.select('g.range circle').attr('r', cellWidth / 2).attr('cx', cx).attr('cy', cy).attr('fill', 'royalblue');\n                let leftValueBound = Math.max(minValue, valueRange[0]),\n                    rightValueBound = Math.min(maxValue, valueRange[1]);\n                let leftLineData = [];\n                let rightLineData = [];\n                leftLineData.push({ x: cx, y: cy });\n                rightLineData.push({ x: cx, y: cy });\n                let nearX = valueScaleSideMargins + valueToX(leftValueBound);\n                let farX = valueScaleSideMargins + valueToX(rightValueBound);\n                // Intermediary points for curving\n                leftLineData.push({\n                    x: cx - 10,\n                    y: cy - 20\n                });\n                leftLineData.push({\n                    x: nearX,\n                    y: valueScaleTopMargin + 20\n                });\n                rightLineData.push({\n                    x: cx + 10,\n                    y: cy - 20\n                });\n                rightLineData.push({\n                    x: farX,\n                    y: valueScaleTopMargin + 20\n                });\n\n                // Point on value line\n                leftLineData.push({\n                    x: nearX,\n                    y: valueScaleTopMargin\n                });\n                rightLineData.push({\n                    x: farX,\n                    y: valueScaleTopMargin\n                });\n                $hoverGroup.select('path.left').attr('d', lineFunction(leftLineData)).attr('stroke', 'black').attr('fill', 'none');\n                $hoverGroup.select('path.right').attr('d', lineFunction(rightLineData)).attr('stroke', 'black').attr('fill', 'none');\n                $hoverGroup.attr('visibility', 'visible');\n            });\n            $outputGroup.on('mouseout', () => {\n                $hoverGroup.attr('visibility', 'hidden');\n            });\n        }\n\n        function updateValue(value) {\n            let xOffset = valueScaleSideMargins,\n                yOffset = valueScaleTopMargin,\n                markerWidth = 1,\n                markerHeight = 30;\n\n            let x = valueToX(value) - markerWidth / 2;\n            let y = -(markerHeight / 2);\n\n            $svg.select('g.value text').attr('x', x).attr('y', y).attr('font-family', 'sans-serif').attr('font-size', '10pt').text(value);\n            let spacing = 7;\n            $svg.select('g.value rect').attr('stroke', 'red').attr('stroke-width', 1.5).attr('fill', 'none').attr('width', markerWidth).attr('height', markerHeight).attr('x', x).attr('y', y + spacing);\n\n            $svg.select('g.value').attr('transform', 'translate(' + xOffset + ',' + yOffset + ')');\n        }\n\n        function updateDisplays(encoding, value) {\n            updateOutputBits(encoding, width);\n            updateValue(value);\n        }\n\n        function encode(value) {\n            encoder.resolution = resolution;\n            let encoding = encoder.encode(value);\n            updateDisplays(encoding, value);\n        }\n\n        function setUpValueAxis(min, max, maxWidth) {\n            let width = maxWidth - valueScaleSideMargins * 2;\n            let x = valueScaleSideMargins,\n                y = valueScaleTopMargin;\n            valueToX = d3.scaleLinear().domain([min, max]).range([0, width]);\n            xToValue = d3.scaleLinear().domain([0, width]).range([min, max]);\n            let xAxis = d3.axisBottom(valueToX);\n            $svg.append('g').attr('transform', 'translate(' + x + ',' + y + ')').call(xAxis);\n            $svg.on('mousemove', () => {\n                let mouse = d3.mouse($svg.node());\n                if (mouse[1] > 80) return;\n                let mouseX = mouse[0] - valueScaleSideMargins;\n                mouseX = Math.min(maxWidth - valueScaleSideMargins * 2, mouseX);\n                mouseX = Math.max(0, mouseX);\n                value = utils.precisionRound(xToValue(mouseX), 1);\n                runEncode();\n            });\n        }\n\n        setUpValueAxis(minValue, maxValue, width);\n\n        function runEncode() {\n            resolution = parseInt(parseInt($resolutionSlider.val()) / 100);\n            encode(value);\n            $valueDisplays.html(value);\n            $resolutionDisplays.html(resolution);\n        }\n\n        $resolutionSlider.on('input', () => {\n            resolution = parseInt(parseInt($resolutionSlider.val()) / 100);\n            encoder = new RelativeScalarEncoder(bits, resolution, minValue, maxValue);\n            runEncode();\n        });\n\n        encoder = new RelativeScalarEncoder(bits, resolution, minValue, maxValue);\n        runEncode();\n    });\n};\n\n//# sourceURL=webpack:///./src/widgets/encoders/numbers/simpleNumberEncoder.js?");

/***/ }),

/***/ "./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html":
/*!********************************************************************!*\
  !*** ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (`<svg>\n    <g class=\"value\">\n        <text></text>\n        <rect></rect>\n    </g>\n    <g class=\"encoding\"></g>\n    <g class=\"range\" visibility=\"hidden\">\n        <circle></circle>\n        <path class=\"left\"></path>\n        <path class=\"right\"></path>\n    </g>\n</svg>\n\n<div>\n    <p>\n        <input type=\"range\" min=\"1\" max=\"5500\" step=\"100\" value=\"500\" id=\"resolutionSlider\"> resolution:\n        <span class=\"resolutionDisplay\"></span>\n    </p>\n</div>\n\n`);\n\n//# sourceURL=webpack:///./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html?");

/***/ }),

/***/ "./src/widgets/utils.js":
/*!******************************!*\
  !*** ./src/widgets/utils.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("// Loads given html into an element, calls the cb one time when loaded.\nfunction loadHtml(html, elementId, cb) {\n    let $el = $('#' + elementId);\n    $el.one('DOMNodeInserted', cb);\n    $el.html(html);\n}\n\nfunction getRandomInt(max) {\n    return Math.floor(Math.random() * Math.floor(max));\n}\n\nfunction precisionRound(number, precision) {\n    let factor = Math.pow(10, precision);\n    return Math.round(number * factor) / factor;\n}\n\nmodule.exports = {\n    loadHtml: loadHtml,\n    getRandomInt: getRandomInt,\n    precisionRound: precisionRound\n};\n\n//# sourceURL=webpack:///./src/widgets/utils.js?");

/***/ }),

/***/ 0:
/*!********************************************************************************************************************************************************************************************************************!*\
  !*** multi ./src/htm/encoders/relativeScalarEncoder.js ./src/widgets/encoders/numbers/index.js ./src/widgets/encoders/numbers/simpleNumberEncoder.js ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html ***!
  \********************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./src/htm/encoders/relativeScalarEncoder.js */\"./src/htm/encoders/relativeScalarEncoder.js\");\n__webpack_require__(/*! ./src/widgets/encoders/numbers/index.js */\"./src/widgets/encoders/numbers/index.js\");\n__webpack_require__(/*! ./src/widgets/encoders/numbers/simpleNumberEncoder.js */\"./src/widgets/encoders/numbers/simpleNumberEncoder.js\");\nmodule.exports = __webpack_require__(/*! ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html */\"./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html\");\n\n\n//# sourceURL=webpack:///multi_./src/htm/encoders/relativeScalarEncoder.js_./src/widgets/encoders/numbers/index.js_./src/widgets/encoders/numbers/simpleNumberEncoder.js_./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html?");

/***/ })

/******/ });