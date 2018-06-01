"use strict";
let path = require("path")
let fs = require("fs")

let pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
)
let version = pkg.version
let mode = 'development'

let modules = []

// encoding-numbers/
modules.push({
    mode: mode,
    entry: [
        "./src/viz/bhtms/encoding-numbers/index.js",
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            },
            {
                test: /tmpl\.html$/,
                loader: "posthtml-loader"
            }
        ]
    },
    resolve: {
        alias: {
            JSDS: path.join(__dirname, "node_modules/javascript-data-store/src/jsds"),
            SdrUtils: path.join(__dirname, "node_modules/cell-viz/src/SdrUtils"),
            SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing"),
            ScalarEncoder: path.join(__dirname, "node_modules/simplehtm/src/encoders/scalar"),
            RelativeScalarEncoder: path.join(__dirname, "node_modules/simplehtm/src/encoders/relativeScalar"),
        }
    },
    output: {
        path: __dirname + "/docs",
        filename: `bhtms-encoding-numbers-${version}.js`
    }
})
// encoding-categories
modules.push({
    mode: mode,
    entry: [
        "./src/viz/bhtms/encoding-categories/index.js",
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            },
            {
                test: /tmpl\.html$/,
                loader: "posthtml-loader"
            }
        ]
    },
    resolve: {
        alias: {
            JSDS: path.join(__dirname, "node_modules/javascript-data-store/src/jsds"),
            SdrUtils: path.join(__dirname, "node_modules/cell-viz/src/SdrUtils"),
            SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing"),
            ScalarEncoder: path.join(__dirname, "node_modules/simplehtm/src/encoders/scalar"),
            RelativeScalarEncoder: path.join(__dirname, "node_modules/simplehtm/src/encoders/relativeScalar"),
            CyclicCategoryEncoderDisplay: path.join(__dirname, "src/lib/displays/cyclicCategoryEncoderDisplay"),
            CyclicCategoryEncoder: path.join(__dirname, "src/lib/htm/cyclicCategoryEncoder"),
        }
    },
    output: {
        path: __dirname + "/docs",
        filename: `bhtms-encoding-categories-${version}.js`
    }
})

// /input-space/
modules.push({
    mode: mode,
    entry: [
        "./src/viz/bhtms/input-space/index.js",
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            },
            {
                test: /tmpl\.html$/,
                loader: "posthtml-loader"
            }
        ]
    },
    resolve: {
        alias: {
            JSDS: path.join(__dirname, "node_modules/javascript-data-store/src/jsds"),
            SdrUtils: path.join(__dirname, "node_modules/cell-viz/src/SdrUtils"),
            SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing"),
            RelativeScalarEncoder: path.join(__dirname, "node_modules/simplehtm/src/encoders/relativeScalar"),
            CyclicCategoryEncoderDisplay: path.join(__dirname, "src/lib/displays/cyclicCategoryEncoderDisplay"),
            CyclicCategoryEncoder: path.join(__dirname, "src/lib/htm/cyclicCategoryEncoder"),
        }
    },
    output: {
        path: __dirname + "/docs",
        filename: `bhtms-input-space-${version}.js`
    }
})

// For Blogs

// How Grid Cells Map Space
modules.push({
    mode: mode,
    entry: [
        "./src/viz/blogs/how-grid-cells-map-space/index.js",
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            },
            {
                test: /tmpl\.html$/,
                loader: "posthtml-loader"
            }
        ]
    },
    resolve: {
        alias: {
            JSDS: path.join(__dirname, "node_modules/javascript-data-store/src/jsds"),
            SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing"),
            HexagonGridCellModule: path.join(__dirname, "src/lib/gridCells/hex-gcm"),
        }
    },
    output: {
        path: __dirname + "/docs",
        filename: `bhtms-how-grid-cells-map-space-${version}.js`
    }
})

module.exports = modules
