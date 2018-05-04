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

/***/ "./src/gridCells/1d-gcm.js":
/*!*********************************!*\
  !*** ./src/gridCells/1d-gcm.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("let GridCell = __webpack_require__(/*! ./grid-cell-module */ \"./src/gridCells/grid-cell-module.js\").GridCell;\nlet GridCellModule = __webpack_require__(/*! ./grid-cell-module */ \"./src/gridCells/grid-cell-module.js\").GridCellModule;\n\nfunction fillByHover(data, config) {\n    if (config.highlightGridCell !== undefined) {\n        if (config.highlightGridCell === data.gridCell.id && data.hover) return data.rgb;\n    } else {\n        if (data.hover) return data.rgb;\n    }\n    return 'none';\n}\n\nfunction fillWithFields(data, config) {\n    let point = data;\n    if (config.highlightGridCell !== undefined) {\n        if (config.highlightGridCell === data.gridCell.id) {\n            if (!point.gridCell.isPadding && point.gridCell.isActive()) {\n                return data.rgb;\n            }\n        }\n        return 'none';\n    }\n    if (!point.gridCell.isPadding && point.gridCell.isActive()) {\n        return data.rgb;\n    }\n    return 'none';\n}\n\nclass OneDimensionalGridCellModule extends GridCellModule {\n\n    constructor(id, xDim, scale) {\n        super(id);\n        this.xDim = xDim;\n        this.scale = scale;\n        this.height = 50;\n        this.gridCells = this.createGridCells();\n    }\n\n    createGridCells() {\n        let cells = [];\n        for (let x = 0; x < this.xDim; x++) {\n            cells.push(new GridCell(cells.length, x, 0));\n        }\n        return cells;\n    }\n\n    getEncoding() {\n        let justGridCells = this.gridCells.filter(gc => !gc.isPadding);\n        let out = [];\n        let weight = this.weight;\n        justGridCells.forEach(gc => {\n            let bit = gc.isActive() ? 1 : 0;\n            for (let x = 0; x < weight; x++) {\n                out.push(bit);\n            }\n        });\n        return out;\n    }\n\n    _getGridCellAt(x) {\n        for (let i = 0; i < this.gridCells.length; i++) {\n            let cell = this.gridCells[i];\n            if (cell.x == x) return cell;\n        }\n        debugger;\n    }\n\n    createOverlayPoints() {\n        let scale = this.scale;\n        let out = this.gridCells.map(function (gc, i) {\n            let x = gc.x * scale;\n            return {\n                id: i,\n                x: x,\n                y: 0,\n                gridCell: gc,\n                alpha: 0.1\n            };\n        });\n        return out;\n    }\n\n    createWorldPoints(origin, w, h) {\n        // Start rendering points at the origin by rendering grid cell modules\n        // over the entire space, leaving enough room for rotation.\n        let startAt = 0,\n            endAt = w;\n        let x = startAt;\n        let gridx = 0;\n        let pointId = 0;\n        let points = [];\n        while (x <= endAt) {\n            let point = {\n                id: pointId++,\n                x: x,\n                y: h / 2 - this.height,\n                gridCell: this._getGridCellAt(gridx),\n                alpha: 0.1\n                // Only save points that are currently on the screen, within a\n                // buffer defined by the grid scale\n            };if (point.x >= origin.x - this.scale && point.x <= origin.x + w + this.scale) {\n                points.push(point);\n            }\n            x += this.scale;\n            gridx++;\n            // This resets the grid cell module x dimension so it tiles.\n            if (gridx > this.xDim - 1) gridx = 0;\n        }\n        return points;\n    }\n\n    getShape() {\n        return 'rect';\n    }\n\n    treatPoint(rects, texts, config) {\n        rects.attr(\"class\", \"cell\").attr('x', function (data) {\n            return data.x;\n        }).attr('y', function (data) {\n            return data.y;\n        }).attr('width', this.scale).attr('height', this.height).attr('stroke', '#bbb').attr('stroke-width', function (data) {\n            let out = config.stroke;\n            if (config.lite) out = 0;\n            if (data.gridCell.isPadding) out = 0;\n            return out;\n        }).attr('fill', data => {\n            if (config.showFields) return fillWithFields(data, config);else return fillByHover(data, config);\n        }).attr('fill-opacity', config.fillOpacity || 0.75);\n\n        texts.attr('x', function (d) {\n            return d.x - 3;\n        }).attr('y', function (d) {\n            return d.y + 3;\n        }).attr('font-size', config.textSize).attr('fill', 'white').text(function (d) {\n            let gc = d.gridCell;\n            if (!gc.isPadding && gc.isActive()) return d.gridCell.id;\n        });\n    }\n}\n\nmodule.exports = OneDimensionalGridCellModule;\n\n//# sourceURL=webpack:///./src/gridCells/1d-gcm.js?");

/***/ }),

/***/ "./src/gridCells/gcm-renderer.js":
/*!***************************************!*\
  !*** ./src/gridCells/gcm-renderer.js ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("function fillWithFields(data, config) {\n    let point = data;\n    if (config.highlightGridCell !== undefined) {\n        if (config.highlightGridCell === data.gridCell.id) {\n            if (!point.gridCell.isPadding && point.gridCell.isActive()) {\n                return data.rgb;\n            }\n        }\n        return 'none';\n    }\n    if (!point.gridCell.isPadding && point.gridCell.isActive()) {\n        return data.rgb;\n    }\n    return 'none';\n}\n\nclass GridCellModuleRenderer {\n    constructor(modules) {\n        this.modules = modules;\n        this.clickLocations = [];\n    }\n\n    onWorld(eventName, handler) {\n        d3.select('#world').on(eventName, handler);\n    }\n\n    onOverlay(eventName, handler) {\n        d3.selectAll('#module-overlays svg').on(eventName, handler);\n    }\n\n    prepareRender() {\n        let me = this;\n        this.width = window.innerWidth;\n        this.height = window.innerHeight;\n        this.$world = d3.select('body').append('svg').attr('id', 'world').attr('width', this.width).attr('height', this.height);\n        this.$gcmPanel = d3.select('body').append('ul').attr('id', 'module-overlays');\n        this.modules.forEach(function (module, i) {\n            me.$gcmPanel.append('li').append('svg').attr('id', 'module-overlay-' + i).attr('style', () => {\n                let display = 'display:';\n                if (module.visible) display += 'block';else display += 'none';\n                return display;\n            });\n        });\n        d3.select('body').append('div').attr('id', 'encoding-container').append('div').attr('id', 'encoding');\n    }\n\n    render(config, intersectX, intersectY, callback) {\n        function treatGroups(groups) {\n            groups.attr('id', function (m) {\n                return 'module-' + m.id;\n            }).attr('visibility', function (m) {\n                if (m.visible) return 'visible';\n                return 'hidden';\n            }).attr('class', 'module-projection');\n        }\n\n        // Update\n        let groups = this.$world.selectAll('g.module-projection').data(this.modules);\n        treatGroups(groups);\n\n        // Enter\n        let coming = groups.enter().append('g').attr('class', 'module-projection');\n        treatGroups(coming);\n\n        // Exit\n        groups.exit().remove();\n\n        this.renderFromWorld(config, intersectX, intersectY);\n        if (config.sdr) this.renderSdr(config);\n\n        // Update module overlay visibility\n        this.modules.forEach(m => {\n            let svg = d3.select('#module-overlay-' + m.id);\n            let display = 'display:';\n            if (m.visible) display += 'inline';else display += 'none';\n            svg.attr('style', display);\n        });\n        // add group for clicks\n        this.$world.append('g').attr('class', 'clicks');\n\n        if (callback) callback();\n    }\n\n    renderFromWorld(config, mouseX, mouseY) {\n        throw new Error('GridCellModuleRenderer implementations must provide renderFromWorld()');\n    }\n\n    renderFromOverlay(moduleIndex, config, mouseX, mouseY) {\n        throw new Error('GridCellModuleRenderer implementations must provide renderFromOverlay()');\n    }\n\n    renderSdr(config) {\n        let encoding = [];\n        this.modules.forEach(function (m) {\n            encoding = encoding.concat(m.getEncoding());\n        });\n        this.encoding = encoding;\n        SDR.draw(encoding, 'encoding', {\n            spartan: true,\n            size: config.sdrSize || 30,\n            line: config.sdrLine\n        });\n    }\n\n    saveLocationEncoding(x, y, encoding) {\n        this.clickLocations.push({\n            x: x, y: y, encoding: encoding\n        });\n    }\n}\n\nclass CircleGridCellModuleRenderer extends GridCellModuleRenderer {\n\n    renderFromWorld(config, mouseX, mouseY) {\n        if (config.screenLock) return;\n        let me = this;\n        let groups = this.$world.selectAll('g.module-projection');\n        this._renderWorldCells(groups, config, mouseX, mouseY);\n        let configCopy = Object.assign({}, config);\n        configCopy.showFields = true;\n        this.modules.forEach(function (module, i) {\n            let svgs = d3.selectAll('#module-overlays svg');\n            me._renderModuleOverlayCells(svgs, i, configCopy);\n        });\n        if (config.sdr) {\n            $('#encoding-container').show();\n            this.renderSdr(config);\n            if (this.clickLocations.length) {\n                this._renderClickLocations();\n            }\n        } else {\n            $('#encoding-container').hide();\n        }\n    }\n\n    renderFromOverlay(moduleIndex, config, mouseX, mouseY) {\n        if (config.screenLock) return;\n        let me = this;\n        let configCopy = Object.assign({}, config);\n        configCopy.showFields = true;\n        this.modules.forEach(function (module, i) {\n            let x = undefined,\n                y = undefined;\n            if (i == moduleIndex) {\n                x = mouseX;\n                y = mouseY;\n            } else {\n                module.clearActiveGridCells();\n            }\n            let svgs = d3.selectAll('#module-overlays svg');\n            me._renderModuleOverlayCells(svgs, moduleIndex, configCopy, x, y);\n        });\n        let groups = d3.selectAll('g.module-projection');\n        this._renderWorldCells(groups, configCopy, fillWithFields);\n        if (config.sdr) this.renderSdr(config);\n    }\n\n    _renderModuleOverlayCells(svgs, moduleIndex, config, mouseX, mouseY) {\n        let me = this;\n        this.overlayPoints = [];\n        let m = this.modules[moduleIndex];\n        let scale = m.scale;\n        let origin = { x: scale * 3, y: scale * 3 };\n\n        let points = m.createOverlayPoints(origin);\n        if (mouseX !== undefined && mouseY !== undefined) {\n            m.intersectOverlay(mouseX, mouseY, points);\n        }\n        me.overlayPoints.push(points);\n\n        let svg = d3.select(svgs.nodes()[moduleIndex]);\n        let width = Math.max(...points.map(function (p) {\n            return p.x;\n        }));\n        if (width % m.scale == 0) width += m.scale;\n        let height = Math.max(...points.map(function (p) {\n            return p.y;\n        }));\n        if (height == 0) height = m.height;\n        svg.attr('width', width).attr('height', height);\n\n        let rgb = m.getColorString();\n        let data = points.map(p => {\n            p.rgb = rgb;\n            return p;\n        });\n        // We always want to show the strokes on module overlays.\n        let configCopy = Object.assign({}, config);\n        configCopy.lite = false;\n        me._renderPointToElement(m, data, svg, configCopy);\n    }\n\n    _renderWorldCells(groups, config, mouseX, mouseY) {\n        let me = this;\n        this.worldPoints = [];\n        let origin = { x: 0, y: 0 };\n        let width = this.width;\n        let height = this.height;\n        let configCopy = Object.assign({}, config);\n        configCopy.stroke = 1;\n        this.modules.forEach(function (m, i) {\n            if (!m.visible) {\n                me.worldPoints.push([]);\n                return;\n            }\n\n            let g = d3.select(groups.nodes()[i]);\n            let points = m.createWorldPoints(origin, width, height);\n\n            if (mouseX !== undefined && mouseY !== undefined) {\n                // If x/y are here, it means cursor is over the world so we\n                // need to intersect it.\n                m.intersectWorld(mouseX, mouseY, points);\n            }\n\n            me.worldPoints.push(points);\n\n            let rgb = m.getColorString();\n            let data = me.worldPoints[i].map(p => {\n                p.rgb = rgb;\n                return p;\n            });\n            if (!config.computeOnly) me._renderPointToElement(m, data, g, configCopy);\n        });\n    }\n\n    _renderPointToElement(module, data, $target, config) {\n        let textData = data;\n        if (!config.showNumbers) textData = [];\n        // Update\n        let circles = $target.selectAll(module.getShape()).data(data);\n        let texts = $target.selectAll('text').data(textData);\n        module.treatPoint(circles, texts, config);\n\n        // Enter\n        let newCircs = circles.enter().append(module.getShape());\n        let newTexts = texts.enter().append('text');\n        module.treatPoint(newCircs, newTexts, config);\n\n        // Exit\n        circles.exit().remove();\n        texts.exit().remove();\n    }\n\n    _renderClickLocations() {\n        let me = this;\n        let $container = d3.select('g.clicks');\n\n        function treatment($el) {\n            $el.attr('cx', d => {\n                return d.x;\n            }).attr('cy', d => {\n                return d.y;\n            }).attr('r', d => {\n                let currentEncoding = me.encoding;\n                let overlap = window.SDR.tools.getOverlapScore(currentEncoding, d.encoding);\n                return overlap * 6 || 1;\n            }).attr('fill', 'red').attr('fill-opacity', d => {\n                let currentEncoding = me.encoding;\n                let overlap = window.SDR.tools.getOverlapScore(currentEncoding, d.encoding);\n                return overlap / (currentEncoding.length / 20);\n            }).attr('stroke', 'red').attr('stroke-width', '1px');\n        }\n\n        let $clicks = $container.selectAll('circle').data(this.clickLocations);\n        treatment($clicks);\n\n        let $newClicks = $clicks.enter().append('circle').attr('class', 'click');\n        treatment($newClicks);\n\n        $clicks.exit().remove();\n    }\n\n}\n\nmodule.exports = CircleGridCellModuleRenderer;\n\n//# sourceURL=webpack:///./src/gridCells/gcm-renderer.js?");

/***/ }),

/***/ "./src/gridCells/grid-cell-module.js":
/*!*******************************************!*\
  !*** ./src/gridCells/grid-cell-module.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let uniqueArray = arrArg => arrArg.filter((elem, pos, arr) => arr.indexOf(elem) == pos);\n\nclass GridCell {\n    constructor(id, x, y) {\n        this.id = id;\n        this.x = x;\n        this.y = y;\n        this.active = false;\n    }\n\n    activate() {\n        this.active = true;\n    }\n\n    deactivate() {\n        this.active = false;\n    }\n\n    isActive() {\n        return this.active;\n    }\n}\n\nclass GridCellModule {\n\n    constructor(id, orientation) {\n        this.id = id;\n        this.setColor(100, 100, 255);\n        this.orientation = orientation || 0;\n        this.visible = true;\n        this.activeCells = 1;\n        this.weight = 1;\n    }\n\n    static translatePoint(pointX, pointY, originX, originY, degrees) {\n        let angle = degrees * (Math.PI / 180);\n        return {\n            x: Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,\n            y: Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY\n        };\n    }\n\n    static getRandomInt(minin, maxin) {\n        let min = Math.ceil(minin);\n        let max = Math.floor(maxin);\n        return Math.floor(Math.random() * (max - min)) + min;\n    }\n\n    createOverlayPoints() {\n        throw new Error('GridCellModule implementations must provide createOverlayPoints()');\n    }\n\n    createWorldPoints(origin, w, h, orientation) {\n        throw new Error('GridCellModule implementations must provide createWorldPoints()');\n    }\n\n    createGridCells() {\n        throw new Error('GridCellModule implementations must provide createGridCells()');\n    }\n\n    getEncoding() {\n        throw new Error('GridCellModule implementations must provide getEncoding()');\n    }\n\n    setColor(r, g, b) {\n        this.r = r;\n        this.g = g;\n        this.b = b;\n    }\n\n    getColorString() {\n        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';\n    }\n\n    intersectWorld(x, y, points) {\n        // We want to take the mouse position on the world and do two things:\n        // 1. mark the closest point(s) in each GCM world where the cursor is\n        //    intersecting the world\n        // 2. activate grid cells in each GCM globally that correspond to these\n        //    points\n        let closestPoints = this.getClosestPointsByDistance(x, y, points, this.activeCells);\n        this.clearActiveGridCells();\n        points.forEach(function (p) {\n            p.hover = false;\n        });\n        closestPoints.forEach(function (p) {\n            p.hover = true;\n            p.gridCell.activate();\n        });\n    }\n\n    intersectOverlay(x, y, points) {\n        // We want to take the mouse position over the GCM overlay and do\n        // these things:\n        // 1. turn off all grid cells across all modules\n        this.clearActiveGridCells();\n        // 2. turn on grid cells within this module corresponding to x,y\n        let gridCells = this.getGridCellsByDistance(x, y, points, this.activeCells);\n        gridCells.forEach(function (cell) {\n            cell.activate();\n        });\n    }\n\n    getClosestPointsByDistance(x, y, points, count) {\n        let mappedDistances = points.map(function (p, i) {\n            return { index: i, distance: Math.hypot(p.x - x, p.y - y) };\n        });\n        mappedDistances.sort(function (a, b) {\n            if (a.distance > b.distance) return 1;\n            if (a.distance < b.distance) return -1;\n            return 0;\n        });\n        let unique = uniqueArray(mappedDistances).slice(0, count);\n        return unique.map(function (point) {\n            return points[point.index];\n        });\n    }\n\n    getPointsByDistance(x, y, points) {\n        let mappedDistances = points.map(function (p, i) {\n            return { index: i, distance: Math.hypot(p.x - x, p.y - y) };\n        });\n        mappedDistances.sort(function (a, b) {\n            if (a.distance > b.distance) return 1;\n            if (a.distance < b.distance) return -1;\n            return 0;\n        });\n        return uniqueArray(mappedDistances);\n    }\n\n    getGridCellsByDistance(x, y, points, count) {\n        let pointsByDistance = this.getPointsByDistance(x, y, points);\n        let noPadding = pointsByDistance.filter(function (point) {\n            let p = points[point.index];\n            return p.gridCell && !p.gridCell.isPadding;\n        });\n        return noPadding.map(function (mappedDistance) {\n            return points[mappedDistance.index].gridCell;\n        }).slice(0, count);\n    }\n\n    clearActiveGridCells() {\n        this.gridCells.forEach(function (cell) {\n            cell.deactivate();\n        });\n    }\n\n}\n\nmodule.exports = {\n    GridCell: GridCell,\n    GridCellModule: GridCellModule\n};\n\n//# sourceURL=webpack:///./src/gridCells/grid-cell-module.js?");

/***/ }),

/***/ "./src/gridCells/index.js":
/*!********************************!*\
  !*** ./src/gridCells/index.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("window.BHTMS.gridCells = {\n    OneDimensionalGridCellModule: __webpack_require__(/*! ./1d-gcm */ \"./src/gridCells/1d-gcm.js\"),\n    CircleGridCellModuleRenderer: __webpack_require__(/*! ./gcm-renderer */ \"./src/gridCells/gcm-renderer.js\"),\n    GridCell: __webpack_require__(/*! ./grid-cell-module */ \"./src/gridCells/grid-cell-module.js\").GridCell,\n    GridCellModule: __webpack_require__(/*! ./grid-cell-module */ \"./src/gridCells/grid-cell-module.js\").GridCellModule\n};\n\n//# sourceURL=webpack:///./src/gridCells/index.js?");

/***/ }),

/***/ 0:
/*!**************************************!*\
  !*** multi ./src/gridCells/index.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("module.exports = __webpack_require__(/*! ./src/gridCells/index.js */\"./src/gridCells/index.js\");\n\n\n//# sourceURL=webpack:///multi_./src/gridCells/index.js?");

/***/ })

/******/ });