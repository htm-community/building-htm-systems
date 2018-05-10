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

// /input-space/
modules.push({
    mode: mode,
    entry: [
        "./src/widgets/input-space/index.js",
        "./src/widgets/input-space/potentialPools.tmpl.html",
        "./src/widgets/input-space/potentialPools.js",
        "./src/widgets/input-space/initialPerms.tmpl.html",
        "./src/widgets/input-space/initialPerms.js",
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

// How Do Grid Cells Work?
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
            HexagonGridCellModule: path.join(__dirname, "src/gridCells/hex-gcm"),
        }
    },
    output: {
        path: __dirname + "/docs",
        filename: `bhtms-how-do-grid-cells-work-${version}.js`
    }
})


module.exports = modules
