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

eval("let utils = __webpack_require__(/*! ../../utils */ \"./src/widgets/utils.js\");\nlet html = __webpack_require__(/*! ./simpleNumberEncoder.tmpl.html */ \"./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html\");\n\nconst onColor = 'skyblue';\nconst offColor = 'white';\n\nmodule.exports = elementId => {\n\n    utils.loadHtml(html.default, elementId, () => {\n\n        let width = 560,\n            height = 160,\n            minValue = 0,\n            maxValue = 55,\n            bits = 100,\n            value = 30;\n\n        let valueScaleTopMargin = 40,\n            valueScaleSideMargins = 10;\n\n        let $rangeSlider = $('#rangeSlider'),\n            $valueDisplays = $('.valueDisplay'),\n            $rangeDisplays = $('.rangeDisplay'),\n            $hoverIndexDisplay = $('.hoverIndexDisplay'),\n            $hoverLeftRangeDisplay = $('.hoverLeftRangeDisplay'),\n            $hoverRightRangeDisplay = $('.hoverRightRangeDisplay');\n\n        let $svg = d3.select('#' + elementId).select('svg').attr('width', width).attr('height', height);\n\n        let valueToX;\n        let xToValue;\n        let bitsToValue = d3.scaleLinear().domain([0, bits]).range([minValue, maxValue]);\n\n        function updateOutputBits(encoding, maxWidth) {\n            let topMargin = 120;\n            let padding = 10;\n            let bits = encoding.length;\n            let width = maxWidth - padding * 2;\n            let bitsToOutputDisplay = d3.scaleLinear().domain([0, bits]).range([0, width]);\n            let cellWidth = Math.floor(width / bits);\n            let $outputGroup = $svg.select('g.encoding');\n            let $hoverGroup = $svg.select('g.range');\n            let range = parseInt($rangeSlider.val()) / 100;\n\n            let lineFunction = d3.line().x(function (d) {\n                return d.x;\n            }).y(function (d) {\n                return d.y;\n            }).curve(d3.curveCatmullRom.alpha(0.5));\n\n            function treatCellRects(r) {\n                r.attr('class', 'bit').attr('fill', d => {\n                    if (d) return onColor;else return offColor;\n                }).attr('stroke', 'darkgrey').attr('stroke-width', 0.5).attr('fill-opacity', 1).attr('x', function (d, i) {\n                    return bitsToOutputDisplay(i);\n                }).attr('y', padding).attr('width', cellWidth).attr('height', cellWidth * 4);\n            }\n\n            // Update\n            let rects = $outputGroup.selectAll('rect.bit').data(encoding);\n            treatCellRects(rects);\n\n            // Enter\n            let newRects = rects.enter().append('rect');\n            treatCellRects(newRects);\n\n            // Exit\n            rects.exit().remove();\n\n            $outputGroup.attr('transform', 'translate(' + padding + ',' + topMargin + ')');\n\n            rects = $outputGroup.selectAll('rect.bit');\n\n            rects.on('mouseenter', (bit, index) => {\n                let centerValueForBit = bitsToValue(index);\n                let cx = padding + bitsToOutputDisplay(index) + cellWidth / 2;\n                let cy = topMargin + 12;\n                $hoverGroup.select('g.range circle').attr('r', cellWidth / 2).attr('cx', cx).attr('cy', cy).attr('fill', 'royalblue');\n                let leftValueBound = Math.max(minValue, centerValueForBit - range / 2),\n                    rightValueBound = Math.min(maxValue, centerValueForBit + range / 2);\n                let leftLineData = [];\n                let rightLineData = [];\n                // Circle point\n                leftLineData.push({ x: cx, y: cy });\n                rightLineData.push({ x: cx, y: cy });\n                let nearX = valueScaleSideMargins + valueToX(leftValueBound);\n                let farX = valueScaleSideMargins + valueToX(rightValueBound);\n                // Intermediary points for curving\n                leftLineData.push({\n                    x: cx - 10,\n                    y: cy - 20\n                });\n                leftLineData.push({\n                    x: nearX,\n                    y: valueScaleTopMargin + 20\n                });\n                rightLineData.push({\n                    x: cx + 10,\n                    y: cy - 20\n                });\n                rightLineData.push({\n                    x: farX,\n                    y: valueScaleTopMargin + 20\n                });\n\n                // Point on value line\n                leftLineData.push({\n                    x: nearX,\n                    y: valueScaleTopMargin\n                });\n                rightLineData.push({\n                    x: farX,\n                    y: valueScaleTopMargin\n                });\n                $hoverGroup.select('path.left').attr('d', lineFunction(leftLineData)).attr('stroke', 'black').attr('fill', 'none');\n                $hoverGroup.select('path.right').attr('d', lineFunction(rightLineData)).attr('stroke', 'black').attr('fill', 'none');\n                $hoverGroup.attr('visibility', 'visible');\n                $hoverIndexDisplay.html(index);\n                $hoverLeftRangeDisplay.html(utils.precisionRound(leftValueBound, 2));\n                $hoverRightRangeDisplay.html(utils.precisionRound(rightValueBound, 2));\n            });\n            $outputGroup.on('mouseout', () => {\n                $hoverGroup.attr('visibility', 'hidden');\n            });\n        }\n\n        function updateValue(value) {\n            let xOffset = valueScaleSideMargins,\n                yOffset = valueScaleTopMargin,\n                markerWidth = 1,\n                markerHeight = 30;\n\n            let x = valueToX(value) - markerWidth / 2;\n            let y = -(markerHeight / 2);\n\n            $svg.select('g.value text').attr('x', x).attr('y', y).attr('font-family', 'sans-serif').attr('font-size', '10pt').text(value);\n            let spacing = 7;\n            $svg.select('g.value rect').attr('stroke', 'red').attr('stroke-width', 1.5).attr('fill', 'none').attr('width', markerWidth).attr('height', markerHeight).attr('x', x).attr('y', y + spacing);\n\n            $svg.select('g.value').attr('transform', 'translate(' + xOffset + ',' + yOffset + ')');\n        }\n\n        function updateDisplays(encoding, value) {\n            updateOutputBits(encoding, width);\n            updateValue(value);\n        }\n\n        function encode(value, range) {\n            let encoding = [];\n\n            for (let i = 0; i < bits; i++) {\n                let bitValue = bitsToValue(i);\n                let bit = 0;\n                if (Math.abs(bitValue - value) <= range / 2) bit = 1;\n                encoding.push(bit);\n            }\n            updateDisplays(encoding, value);\n        }\n\n        function setUpValueAxis(min, max, maxWidth) {\n            let width = maxWidth - valueScaleSideMargins * 2;\n            let x = valueScaleSideMargins,\n                y = valueScaleTopMargin;\n            valueToX = d3.scaleLinear().domain([min, max]).range([0, width]);\n            xToValue = d3.scaleLinear().domain([0, width]).range([min, max]);\n            let xAxis = d3.axisBottom(valueToX);\n            $svg.append('g').attr('transform', 'translate(' + x + ',' + y + ')').call(xAxis);\n            $svg.on('mousemove', () => {\n                let mouse = d3.mouse($svg.node());\n                if (mouse[1] > 80) return;\n                let mouseX = mouse[0] - valueScaleSideMargins;\n                mouseX = Math.min(maxWidth - valueScaleSideMargins * 2, mouseX);\n                mouseX = Math.max(0, mouseX);\n                value = utils.precisionRound(xToValue(mouseX), 1);\n                runEncode();\n            });\n        }\n\n        setUpValueAxis(minValue, maxValue, width);\n\n        function runEncode() {\n            let range = parseInt($rangeSlider.val()) / 100;\n            encode(value, range);\n            $valueDisplays.html(value);\n            $rangeDisplays.html(range);\n        }\n\n        $rangeSlider.on('input', runEncode);\n\n        runEncode();\n    });\n};\n\n//# sourceURL=webpack:///./src/widgets/encoders/numbers/simpleNumberEncoder.js?");

/***/ }),

/***/ "./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html":
/*!********************************************************************!*\
  !*** ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html ***!
  \********************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony default export */ __webpack_exports__[\"default\"] = (`<svg>\n    <g class=\"value\">\n        <text></text>\n        <rect></rect>\n    </g>\n    <g class=\"encoding\"></g>\n    <g class=\"range\" visibility=\"hidden\">\n        <circle></circle>\n        <path class=\"left\"></path>\n        <path class=\"right\"></path>\n    </g>\n</svg>\n\n<div>\n    <p>\n        <input type=\"range\" min=\"1\" max=\"5500\" value=\"500\" id=\"rangeSlider\"> range encoded in one bit:\n        <span class=\"rangeDisplay\"></span>\n    </p>\n</div>\n\n`);\n\n//# sourceURL=webpack:///./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html?");

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
/*!************************************************************************************************************************************************************************!*\
  !*** multi ./src/widgets/encoders/numbers/index.js ./src/widgets/encoders/numbers/simpleNumberEncoder.js ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html ***!
  \************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./src/widgets/encoders/numbers/index.js */\"./src/widgets/encoders/numbers/index.js\");\n__webpack_require__(/*! ./src/widgets/encoders/numbers/simpleNumberEncoder.js */\"./src/widgets/encoders/numbers/simpleNumberEncoder.js\");\nmodule.exports = __webpack_require__(/*! ./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html */\"./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html\");\n\n\n//# sourceURL=webpack:///multi_./src/widgets/encoders/numbers/index.js_./src/widgets/encoders/numbers/simpleNumberEncoder.js_./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html?");

/***/ })

/******/ });