'use strict';
let path = require('path')
let fs = require('fs')

let pkg = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')
)
let version = pkg.version
let mode = 'development'

let modules = []

// encoding-time/
// This is bundled to be hosted with images
modules.push({
    mode: mode,
    entry: [
        './src/viz/bhtms/encoding-time/index.js',
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            },
            {
                test: /tmpl\.html$/,
                loader: 'posthtml-loader'
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'images',
                    publicPath: '../../../../wp-content/uploads/encoding-time/images/',
                }
            }
        ]
    },
    resolve: {
        alias: {
            moment: path.join(__dirname, 'node_modules/moment/min/moment.min'),
            JSDS: path.join(__dirname, 'node_modules/javascript-data-store/src/jsds'),
            SdrDrawing: path.join(__dirname, 'node_modules/cell-viz/src/SdrDrawing'),
            CyclicEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/cyclicScalar'),
            TransparentCyclicEncoderDisplay: path.join(__dirname, 'src/lib/displays/transparentCyclicEncoderDisplay'),
        }
    },
    output: {
        path: __dirname + '/wp-content/uploads/encoding-time',
        filename: `bhtms-encoding-time-${version}.js`
    }
})


// // encoding-numbers/
// modules.push({
//     mode: mode,
//     entry: [
//         './src/viz/bhtms/encoding-numbers/index.js',
//     ],
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 loader: 'babel-loader'
//             },
//             {
//                 test: /tmpl\.html$/,
//                 loader: 'posthtml-loader'
//             }
//         ]
//     },
//     resolve: {
//         alias: {
//             'dat.gui': path.join(__dirname, 'node_modules/dat.gui/build/dat.gui.min'),
//             JSDS: path.join(__dirname, 'node_modules/javascript-data-store/src/jsds'),
//             SdrUtils: path.join(__dirname, 'node_modules/cell-viz/src/SdrUtils'),
//             SdrDrawing: path.join(__dirname, 'node_modules/cell-viz/src/SdrDrawing'),
//             // ScalarEncoder: path.join(__dirname, '../simplehtm/src/encoders/scalar'),
//             // CyclicEncoder: path.join(__dirname, '../simplehtm/src/encoders/cyclicScalar'),
//             // BoundedScalarEncoder: path.join(__dirname, '../simplehtm/src/encoders/boundedScalar'),
//             ScalarEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/scalar'),
//             BoundedScalarEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/boundedScalar'),
//             CategoryEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/category'),
//             CyclicEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/cyclicScalar'),
//             CyclicEncoderDisplay: path.join(__dirname, 'src/lib/displays/cyclicEncoderDisplay'),
//         }
//     },
//     output: {
//         path: __dirname + '/wp-content/uploads/encoding-numbers',
//         filename: `bhtms-encoding-numbers-${version}.js`
//     }
// })
//
// // encoding-categories
// modules.push({
//     mode: mode,
//     entry: [
//         './src/viz/bhtms/encoding-categories/index.js',
//     ],
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 loader: 'babel-loader'
//             },
//             {
//                 test: /tmpl\.html$/,
//                 loader: 'posthtml-loader'
//             }
//         ]
//     },
//     resolve: {
//         alias: {
//             moment: path.join(__dirname, 'node_modules/moment/min/moment.min'),
//             JSDS: path.join(__dirname, 'node_modules/javascript-data-store/src/jsds'),
//             SdrUtils: path.join(__dirname, 'node_modules/cell-viz/src/SdrUtils'),
//             SdrDrawing: path.join(__dirname, 'node_modules/cell-viz/src/SdrDrawing'),
//             // ScalarEncoder: path.join(__dirname, '../simplehtm/src/encoders/scalar'),
//             // CyclicEncoder: path.join(__dirname, '../simplehtm/src/encoders/cyclicScalar'),
//             ScalarEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/scalar'),
//             CyclicEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/cyclicScalar'),
//             CategoryEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/category'),
//             WeekendEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/weekend'),
//             CyclicEncoderDisplay: path.join(__dirname, 'src/lib/displays/cyclicEncoderDisplay'),
//             CategoryEncoderDisplay: path.join(__dirname, 'src/lib/displays/categoryEncoderDisplay'),
//         }
//     },
//     output: {
//         path: __dirname + '/wp-content/uploads/encoding-categories',
//         filename: `bhtms-encoding-categories-${version}.js`
//     }
// })
//
// // /input-space/
// modules.push({
//     mode: mode,
//     entry: [
//         './src/viz/bhtms/input-space/index.js',
//     ],
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 loader: 'babel-loader'
//             },
//             {
//                 test: /tmpl\.html$/,
//                 loader: 'posthtml-loader'
//             }
//         ]
//     },
//     resolve: {
//         alias: {
//             moment: path.join(__dirname, 'node_modules/moment/moment'),
//             JSDS: path.join(__dirname, 'node_modules/javascript-data-store/src/jsds'),
//             SdrUtils: path.join(__dirname, 'node_modules/cell-viz/src/SdrUtils'),
//             SdrDrawing: path.join(__dirname, 'node_modules/cell-viz/src/SdrDrawing'),
//             // ScalarEncoder: path.join(__dirname, '../simplehtm/src/encoders/scalar'),
//             // CyclicEncoder: path.join(__dirname, '../simplehtm/src/encoders/cyclicScalar'),
//             ScalarEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/scalar'),
//             BoundedScalarEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/boundedScalar'),
//             CyclicEncoder: path.join(__dirname, 'node_modules/simplehtm/src/encoders/cyclicScalar'),
//             CyclicEncoderDisplay: path.join(__dirname, 'src/lib/displays/cyclicEncoderDisplay'),
//         }
//     },
//     output: {
//         path: __dirname + '/wp-content/uploads/input-space',
//         filename: `bhtms-input-space-${version}.js`
//     }
// })
//
// // For Blogs
//
// // How Grid Cells Map Space
// modules.push({
//     mode: mode,
//     entry: [
//         './src/viz/blogs/how-grid-cells-map-space/index.js',
//     ],
//     module: {
//         rules: [
//             {
//                 test: /\.js$/,
//                 loader: 'babel-loader'
//             },
//             {
//                 test: /tmpl\.html$/,
//                 loader: 'posthtml-loader'
//             }
//         ]
//     },
//     resolve: {
//         alias: {
//             JSDS: path.join(__dirname, 'node_modules/javascript-data-store/src/jsds'),
//             SdrDrawing: path.join(__dirname, 'node_modules/cell-viz/src/SdrDrawing'),
//             HexagonGridCellModule: path.join(__dirname, 'src/lib/gridCells/hex-gcm'),
//         }
//     },
//     output: {
//         path: __dirname + '/docs',
//         filename: `bhtms-how-grid-cells-map-space-${version}.js`
//     }
// })

module.exports = modules
