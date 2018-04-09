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
        "./widgets/spatial-pooling/miniColumnPotentialPools.js",
        "./widgets/spatial-pooling/miniColumnInitialPerms.js",
        "./widgets/spatial-pooling/index.js"
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
        path: __dirname + "/dist/widgets",
        filename: `bhtms-spatial-pooling-widgets-${version}.js`
    }
})


module.exports = spatialPoolingWidgets
