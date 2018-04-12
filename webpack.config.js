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
        "./src/widgets/encoders/number/index.js"
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
        filename: `bhtms-number-encoder-widgets-${version}.js`
    }
})

// // Input Space
// modules.push({
//     mode: mode,
//     entry: [
//         "./src/widgets/input-space/index.js"
//     ],
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 loader: "babel-loader"
//             }
//         ]
//     },
//     resolve: {
//         alias: {
//             SdrUtils: path.join(__dirname, "node_modules/cell-viz/src/SdrUtils"),
//             SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing")
//         }
//     },
//     output: {
//         path: __dirname + "/docs/widgets",
//         filename: `bhtms-input-space-widgets-${version}.js`
//     }
// })

// Spatial Pooling
modules.push({
    mode: mode,
    entry: [
        "./src/widgets/spatial-pooling/index.js",
        "./src/widgets/spatial-pooling/potentialPools/template.html",
        "./src/widgets/spatial-pooling/potentialPools/index.js",
        "./src/widgets/spatial-pooling/initialPerms/template.html",
        "./src/widgets/spatial-pooling/initialPerms/index.js",
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader"
            },
            {
                test: /template\.html/,
                loader: "posthtml-loader"
            }
        ]
    },
    resolve: {
        alias: {
            SdrUtils: path.join(__dirname, "node_modules/cell-viz/src/SdrUtils"),
            SdrDrawing: path.join(__dirname, "node_modules/cell-viz/src/SdrDrawing"),
        }
    },
    output: {
        path: __dirname + "/docs/widgets",
        filename: `bhtms-spatial-pooling-widgets-${version}.js`
    }
})

// HTM System
modules.push({
    mode: mode,
    entry: [
        "./src/htm/encoders/scalar.js",
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
        filename: `bhtms-htm-system-${version}.js`
    }
})

module.exports = modules
