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
        "./src/htm/encoders/relativeScalarEncoder.js",
        "./src/widgets/encoders/numbers/index.js",
        "./src/widgets/encoders/numbers/simpleNumberEncoder.js",
        "./src/widgets/encoders/numbers/simpleNumberEncoder.tmpl.html",
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
            SdrUtils: path.join(__dirname, "node_modules/cell-viz/src/SdrUtils"),
            // SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing")
        }
    },
    output: {
        path: __dirname + "/docs/widgets",
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
        path: __dirname + "/docs/widgets",
        filename: `bhtms-spatial-pooling-widgets-${version}.js`
    }
})

// HTM Encoders
modules.push({
    mode: mode,
    entry: [
        "./src/htm/encoders/scalar.js",
        "./src/htm/encoders/relativeScalarEncoder.js",
        "./src/htm/index.js",
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
        filename: `bhtms-htm-encoders-${version}.js`
    }
})

module.exports = modules
