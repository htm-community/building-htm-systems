"use strict";
let path = require("path")
let fs = require("fs")

let pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
)
let version = pkg.version
let mode = 'development'

let modules = []

// Encoder widgets
modules.push({
    mode: mode,
    entry: [
        "./src/widgets/encoders/numbers/index.js",
        "./src/widgets/encoders/numbers/simpleNumberEncoder.js",
        "./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html",
        "./src/widgets/encoders/numbers/scalarWindow.js",
        "./src/widgets/encoders/numbers/scalarWindow.tmpl.html",
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
        filename: `bhtms-encoder-widgets-${version}.js`
    }
})

// Spatial Pooling widgets
modules.push({
    mode: mode,
    entry: [
        "./src/widgets/spatial-pooling/index.js",
        "./src/widgets/spatial-pooling/potentialPools.tmpl.html",
        "./src/widgets/spatial-pooling/potentialPools.js",
        "./src/widgets/spatial-pooling/initialPerms.tmpl.html",
        "./src/widgets/spatial-pooling/initialPerms.js",
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
        filename: `bhtms-sp-widgets-${version}.js`
    }
})

module.exports = modules
