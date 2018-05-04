let utils = require('../../widgets/utils')
let html = require('./oneDimensionalMapping.tmpl.html')

// from http://bl.ocks.org/mbostock/4349187
// Sample from a normal distribution with mean 0, stddev 1.
function normal() {
    let x = 0,
        y = 0,
        rds, c
    do {
        x = Math.random() * 2 - 1
        y = Math.random() * 2 - 1
        rds = x * x + y * y
    } while (rds == 0 || rds > 1)
    c = Math.sqrt(-2 * Math.log(rds) / rds) // Box-Muller transform
    return x * c // throw away extra sample y * c
}

//taken from Jason Davies science library
// https://github.com/jasondavies/science.js/
function gaussian(x) {
    let gaussianConstant = 1 / Math.sqrt(2 * Math.PI),
        mean = 0,
        sigma = 1

    x = (x - mean) / sigma
    return gaussianConstant * Math.exp(-.5 * x * x) / sigma
}

function getData() {
    let data = []
    // loop to populate data array with
    // probabily - quantile pairs
    for (var i = 0; i < 10000; i++) {
        q = normal() // calc random draw from normal dist
        p = gaussian(q) // calc prob of rand draw
        el = {
            "q": q,
            "p": p
        }
        data.push(el)
    }

    // need to sort for plotting
    //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    data.sort(function(x, y) {
        return x.q - y.q
    })
    return data
}

let data = getData()
let dataMax = 0
data.forEach(d => {
    if (d.p > dataMax) dataMax = d.p
})

module.exports = (elId) => {
    utils.loadHtml(html.default, elId, () => {

        let scale = 1.0
        let anchor = 0.0
        let sensitivity = 1.0
        let range = 0.1

        let width = 560
        let height = 100

        let upperHeight = 60
        let barHeight = 30

        let $anchorSlider = $('#anchorPerc')
        $anchorSlider.val(parseInt(anchor * 100))
        let $rangeSlider = $('#rangePerc')
        $rangeSlider.val(parseInt(range * 100))
        let $scaleSlider = $('#scalePerc')
        $scaleSlider.val(parseInt(scale * 100))

        let $svg = d3.select('#' + elId + ' svg')
                    .attr('width', width)
                    .attr('height', height)

        // The bar
        let $barGroup = $svg.append('g').attr('class', 'bar')
        $barGroup.append('rect')
            .attr('width', width)
            .attr('height', barHeight)
            .attr('y', upperHeight)
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .attr('fill', 'none')

        // Wireframe group
        let $wireGroup = $svg.append('g')
            .attr('class', 'wires')

        let $range = $wireGroup.append('line')
            .attr('class', 'range')
            .attr('stroke', 'black')
            .attr('stroke-dasharray', [3, 5])
        let rangeCaps = {}
        rangeCaps.left = $wireGroup.append('line')
            .attr('class', 'range-cap left')
            .attr('stroke', 'black')
        rangeCaps.right = $wireGroup.append('line')
            .attr('class', 'range-cap right')
            .attr('stroke', 'black')

        let $sensitivityCurve = $wireGroup.append('path')
            .attr('class', 'sensitivity')
            .attr('stroke', 'black')
            .attr('fill', 'none')

        let $marker = $svg.append('rect').attr('class', 'marker')


        function updateRange(x, y, $range, rangeCaps) {
            let centerX = (x + (anchor * width)) * scale
            let centerY = y + barHeight / 2
            let rangePix = width * range * scale
            let radius = rangePix / 2
            let x1 = centerX - radius
            let x2 = centerX + radius
            let rangeCapRatio = 8
            $range.attr('x1', x1)
                .attr('y1', centerY)
                .attr('x2', x2)
                .attr('y2', centerY)
            rangeCaps.left.attr('x1', x1)
                .attr('y1', centerY - barHeight / rangeCapRatio)
                .attr('x2', x1)
                .attr('y2', centerY + barHeight / rangeCapRatio)
            rangeCaps.right.attr('x1', x2)
                .attr('y1', centerY - barHeight / rangeCapRatio)
                .attr('x2', x2)
                .attr('y2', centerY + barHeight / rangeCapRatio)
        }

        function updateSensitivityCurve(x, y, $sensitivityCurve) {
            let centerX = (x + (anchor * width)) * scale
            let rangePix = width * range * scale
            let radius = rangePix / 2
            let xLeft = centerX - radius
            let xRight = (centerX + radius)

            let first = data[0]
            let last = data[data.length - 1]
            let xScale = d3.scaleLinear()
                .domain([first.q, last.q])
                .range([xLeft, xRight])
            let yScale = d3.scaleLinear()
                .domain([0, dataMax])
                .range([upperHeight, 0])

            let lineFunction = d3.line()
                .x(function(d) { return xScale(d.q) })
                .y(function(d) { return yScale(d.p) })
                .curve(d3.curveCatmullRom.alpha(0.5))

            $sensitivityCurve.attr('d', lineFunction(data))
        }

        function updateDisplay() {
            let repetitions = Math.ceil(1 / scale)
            let x = 0
            let y = upperHeight

            //function updateAnchor(x, y, $anchor) {
            //    let bx = (x + (anchor * width)) * scale
            //    let by = y + barHeight / 2
            //    $anchor.attr('cx', bx)
            //        .attr('cy', by)
            //}

            function treatWires(wires) {
                wires.attr('class', 'wire')
                    .attr('id', d => 'wire-' + d)
                wires.selectAll('circle.anchor')
                //let $anchor = wires.append('circle')
                //    .attr('class', 'anchor')
                //    .attr('r', 3)
                //    .attr('fill', 'black')
                //updateAnchor(x, y, $anchor)
            }

            // Update
            let $wires = $wireGroup.selectAll('g.wire')
                .data(d3.range(0,repetitions))
            treatWires($wires)

            // Enter
            let $newWires = $wires.enter().append('g')
            treatWires($newWires)

            // Exit
            $wires.exit().remove()

            //for (let i = 0; i < scales; i++) {
            //    updateAnchor(0, upperHeight)
            //    updateRange(0, upperHeight)
            //    updateSensitivityCurve(0, upperHeight)
            //}
        }

        $('#' + elId + ' input').on('input', () => {
            anchor = parseInt($anchorSlider.val()) / 100
            range = parseInt($rangeSlider.val()) / 100
            scale = parseInt($scaleSlider.val()) / 100
            updateDisplay()
        })

        updateDisplay()

    })
}
