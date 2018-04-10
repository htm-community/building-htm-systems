"use strict";
let path = require("path")
let fs = require("fs")

let pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
)
let version = pkg.version

// Spatial Pooling

let spatialPoolingWidgets = []

spatialPoolingWidgets.push({
    mode: 'development',
    entry: [
        "./src/widgets/spatial-pooling/miniColumnPotentialPools.js",
        "./src/widgets/spatial-pooling/miniColumnInitialPerms.js",
        "./src/widgets/spatial-pooling/cells.js",
        "./src/widgets/spatial-pooling/index.js"
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            }
        ]
    },
    resolve: {
        alias: {
            SdrUtils: path.join(__dirname, "node_modules/cell-viz/src/SdrUtils"),
            SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing")
        }
    },
    output: {
        path: __dirname + "/docs/widgets",
        filename: `bhtms-spatial-pooling-widgets-${version}.js`
    }
})

// HTM System
let htmSystem = []

htmSystem.push({
    mode: 'development',
    entry: [
        "./src/htm/cells.js",
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            }
        ]
    },
    output: {
        path: __dirname + "/docs/htm",
        filename: `bhtms-htm-system-${version}.js`
    }
})

module.exports = spatialPoolingWidgets
