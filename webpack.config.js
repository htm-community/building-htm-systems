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
        "./src/widgets/encoding-numbers/index.js",
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
        "./src/widgets/encoding-categories/index.js",
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
        filename: `bhtms-encoding-categories-${version}.js`
    }
})

// /input-space/
modules.push({
    mode: mode,
    entry: [
        "./src/widgets/input-space/index.js",
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
        }
    },
    output: {
        path: __dirname + "/docs",
        filename: `bhtms-input-space-${version}.js`
    }
})

// General Grid Cell viz code
// modules.push({
//     mode: mode,
//     entry: [
//         "./src/gridCells/index.js"
//     ],
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 loader: "babel-loader"
//             },
//             {
//                 test: /tmpl\.html$/,
//                 loader: "posthtml-loader"
//             }
//         ]
//     },
//     output: {
//         path: __dirname + "/docs",
//         filename: `bhtms-grid-cells-${version}.js`
//     }
// })

// For Blogs

// How Grid Cells Map Space
modules.push({
    mode: mode,
    entry: [
        "./src/blogs/how-do-grid-cells-work/index.js",
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
            HexagonGridCellModule: path.join(__dirname, "src/gridCells/hex-gcm"),
        }
    },
    output: {
        path: __dirname + "/docs",
        filename: `bhtms-how-grid-cells-map-space-${version}.js`
    }
})

module.exports = modules
