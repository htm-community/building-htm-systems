"use strict";
let path = require("path")
let fs = require("fs")

let pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, "package.json"), "utf-8")
)
let version = pkg.version

let receptiveFieldWidget = {
    mode: 'development',
    entry: [
        "./widgets/1-receptive-field/visualizations.js",
        "./widgets/1-receptive-field/src/index.js"
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
        path: __dirname + "/widgets/1-receptive-field/out",
        filename: `receptive-field-1.bundle.js`
    }
}


module.exports = [
    receptiveFieldWidget
];
