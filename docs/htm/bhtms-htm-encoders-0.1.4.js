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

eval("class RelativeScalarEncoder {\n\n    constructor(n, resolution, min, max, bounded = false, id = null) {\n        this.id = id;\n        this.n = n;\n        this.resolution = resolution;\n        this.min = min;\n        this.max = max;\n        this.range = max - min;\n        this.bounded = bounded;\n        this._bitIndexToValue = d3.scaleLinear().domain([0, n]).range([min, max]);\n    }\n\n    encode(value) {\n        let encoding = [],\n            resolution = this.resolution,\n            n = this.n,\n            max = this.max;\n        // For each bit in the encoding.\n        for (let i = 0; i < n; i++) {\n            let bitValue = this._bitIndexToValue(i),\n                bit = 0,\n                valueDiff = bitValue - value,\n                valueDistance = Math.abs(valueDiff),\n                radius = resolution / 2;\n            if (valueDistance <= radius) bit = 1;\n            // Keeps the bucket from changing size at min/max values\n            if (this.bounded) {\n                if (value < radius && bitValue < resolution) bit = 1;\n                if (value > max - radius && bitValue > max - resolution) bit = 1;\n            }\n            encoding.push(bit);\n        }\n        return encoding;\n    }\n\n    getRangeFromBitIndex(i) {\n        let v = this._bitIndexToValue(i),\n            res = this.resolution,\n            max = this.max,\n            radius = res / 2,\n            left = Math.max(this.min, v - radius),\n            right = Math.min(this.max, v + radius);\n        // Keeps the bucket from changing size at min/max values\n        if (this.bounded) {\n            if (left < radius) left = 0;\n            if (right > max - radius) right = max;\n        }\n        return [left, right];\n    }\n}\n\nmodule.exports = RelativeScalarEncoder;\n\n//# sourceURL=webpack:///./src/htm/encoders/relativeScalarEncoder.js?");

/***/ }),

/***/ "./src/htm/encoders/scalar.js":
/*!************************************!*\
  !*** ./src/htm/encoders/scalar.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class ScalarEncoder {\n\n    constructor(n, w, min, max) {\n        this.n = n;\n        this.resolution = w;\n        this.numBuckets = n - w + 1;\n        this.range = max - min;\n        this.min = min;\n        this.max = max;\n        this._valueToBitIndex = d3.scaleLinear().domain([0, this.n]).range([min, max]);\n        this.sparsity = w / n;\n    }\n\n    encode(input) {\n        let output = [];\n        let firstBit;\n        let min = this.min;\n        firstBit = Math.floor(this.numBuckets * (input - min) / this.range);\n        for (let i = 0; i < this.n; i++) {\n            output.push(0);\n        }\n        for (let i = 0; i < this.resolution; i++) {\n            if (firstBit + i < output.length) output[firstBit + i] = 1;\n        }\n        return output;\n    }\n\n    getRangeFromBitIndex(i) {\n        let value = this._valueToBitIndex(i);\n        let start = value - this.max * this.sparsity / 2;\n        let end = value + this.max * this.sparsity / 2;\n        let out = [];\n        out.push(start);\n        out.push(end);\n        return out;\n    }\n}\n\nfunction PeriodicScalarEncoder(n, w, radius, minValue, maxValue) {\n    let neededBuckets;\n    // Distribute nBuckets points along the domain [minValue, maxValue],\n    // including the endpoints. The resolution is the width of each band\n    // between the points.\n\n    if (!n && !radius || n && radius) {\n        throw new Error('Exactly one of n / radius must be defined.');\n    }\n\n    this.resolution = w;\n    this.radius = radius;\n    this.minValue = minValue;\n    this.maxValue = maxValue;\n\n    this.range = maxValue - minValue;\n\n    if (n) {\n        this.n = n;\n        this.radius = this.resolution * (this.range / this.n);\n        this.bucketWidth = this.range / this.n;\n    } else {\n        this.bucketWidth = this.radius / this.resolution;\n        neededBuckets = Math.ceil(this.range / this.bucketWidth);\n        if (neededBuckets > this.resolution) {\n            this.n = neededBuckets;\n        } else {\n            this.n = this.resolution + 1;\n        }\n    }\n}\n\nPeriodicScalarEncoder.prototype.getWidth = function () {\n    return this.n;\n};\n\nPeriodicScalarEncoder.prototype.encode = function (input) {\n    let output = [];\n    let i, index;\n    let iBucket = Math.floor((input - this.minValue) / this.bucketWidth);\n    let middleBit = iBucket;\n    let reach = (this.resolution - 1) / 2.0;\n    let left = Math.floor(reach);\n    let right = Math.ceil(reach);\n\n    if (input < this.minValue || input >= this.maxValue) {\n        throw Error('Input out of bounds: ' + input);\n    }\n\n    for (let i = 0; i < this.n; i++) {\n        output.push(0);\n    }\n\n    output[middleBit] = 1;\n\n    for (i = 1; i <= left; i++) {\n        index = middleBit - 1;\n        if (index < 0) {\n            index = index + this.n;\n        }\n        if (index > this.n) {\n            throw Error('out of bounds');\n        }\n        output[index] = 1;\n    }\n    for (i = 1; i <= right; i++) {\n        if ((middleBit + i) % this.n > this.n) {\n            throw Error('out of bounds');\n        }\n        output[(middleBit + i) % this.n] = 1;\n    }\n    return output;\n};\n\nmodule.exports = {\n    ScalarEncoder: ScalarEncoder,\n    PeriodicScalarEncoder: PeriodicScalarEncoder\n};\n\n//# sourceURL=webpack:///./src/htm/encoders/scalar.js?");

/***/ }),

/***/ "./src/htm/index.js":
/*!**************************!*\
  !*** ./src/htm/index.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.BHTMS.encoders = {\n    ScalarEncoder: __webpack_require__(/*! ./encoders/scalar */ \"./src/htm/encoders/scalar.js\"),\n    RelativeScalarEncoder: __webpack_require__(/*! ./encoders/relativeScalarEncoder */ \"./src/htm/encoders/relativeScalarEncoder.js\")\n};\n\n//# sourceURL=webpack:///./src/htm/index.js?");

/***/ }),

/***/ 0:
/*!*********************************************************************************************************!*\
  !*** multi ./src/htm/encoders/scalar.js ./src/htm/encoders/relativeScalarEncoder.js ./src/htm/index.js ***!
  \*********************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! ./src/htm/encoders/scalar.js */\"./src/htm/encoders/scalar.js\");\n__webpack_require__(/*! ./src/htm/encoders/relativeScalarEncoder.js */\"./src/htm/encoders/relativeScalarEncoder.js\");\nmodule.exports = __webpack_require__(/*! ./src/htm/index.js */\"./src/htm/index.js\");\n\n\n//# sourceURL=webpack:///multi_./src/htm/encoders/scalar.js_./src/htm/encoders/relativeScalarEncoder.js_./src/htm/index.js?");

/***/ })

/******/ });