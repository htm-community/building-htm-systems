let utils = require('../../widgets/utils')
let html = require('./oneDimensionalMapping.tmpl.html')

let clrs = {
    barFill: 'lightgrey',
    barStroke: 'grey',
    curveFill: 'salmon',
    curveStroke: 'red',
    anchorStroke: 'black',
    anchorFill: 'none',
    rangeStroke: 'black'
}

module.exports = (elId) => {
    utils.loadHtml(html.default, elId, () => {

        let scale = .2
        let anchor = .5
        let range = 0.5
        let independentVariables = 5

        let width = 450
        let height = 100

        let upperHeight = 40
        let barHeight = 30
        let histTicks = 50

        let $anchorSlider = $('#anchorPerc')
        $anchorSlider.val(parseInt(anchor * 100))
        let $rangeSlider = $('#rangePerc')
        $rangeSlider.val(parseInt(range * 100))
        let $scaleSlider = $('#scalePerc')
        $scaleSlider.val(parseInt(scale * 100))
        let $independentVarsSlider = $('#independentVars')
        $independentVarsSlider.val(parseInt(independentVariables))

        let $svg = d3.select('#' + elId + ' svg')
                    .attr('width', width)
                    .attr('height', height)

        // The bar
        let $barGroup = $svg.append('g').attr('class', 'bar')
        $barGroup.append('rect')
            .attr('width', width)
            .attr('height', barHeight)
            .attr('y', upperHeight)
            .attr('stroke', clrs.barStroke)
            .attr('fill', clrs.barFill)

        // Wireframe group
        let $wireGroup = $svg.append('g')
            .attr('class', 'wires')

        // let $marker = $svg.append('rect').attr('class', 'marker')

        // Playing with data
        let data = createDistribution()

        function createDistribution() {
            let out = d3.range(50000)
                .map(d3.randomBates(independentVariables))
                .map((val, i) => {
                    return val - 0.5
                })
            let equalizer = d3.scaleLinear()
                .domain([Math.min(...out), Math.max(...out)])
                .range([0, 1])
            out = out.map(d => equalizer(d))
            return out
        }

        //
        // Treatments and updates
        //

        // Ranges
        function treatRanges($ranges, rangeCaps, x, y, radius) {
            let x1 = x - radius
            let x2 = x + radius
            let rangeCapRatio = 8

            $ranges
                .attr('class', 'range')
                .attr('stroke', clrs.rangeStroke)
                .attr('stroke-width', '1px')
                .attr('stroke-dasharray', [3, 1])
                .attr('x1', x1)
                .attr('y1', y)
                .attr('x2', x2)
                .attr('y2', y)
            rangeCaps.left
                .attr('class', 'left')
                .attr('stroke', clrs.rangeStroke)
                .attr('x1', x1)
                .attr('y1', y - barHeight / rangeCapRatio)
                .attr('x2', x1)
                .attr('y2', y + barHeight / rangeCapRatio)
            rangeCaps.right
                .attr('class', 'right')
                .attr('stroke', clrs.rangeStroke)
                .attr('x1', x2)
                .attr('y1', y - barHeight / rangeCapRatio)
                .attr('x2', x2)
                .attr('y2', y + barHeight / rangeCapRatio)
        }

        function updateRange($wires, x, y) {
            let centerX = (x + (anchor * width)) * scale
            let centerY = y + barHeight / 2
            let rangePix = width * range * scale
            let radius = rangePix / 2

            // Update
            let $ranges = $wires.selectAll('line.range')
            let rangeCaps = {}
            rangeCaps.left = $wires.selectAll('line.left')
            rangeCaps.right = $wires.selectAll('line.right')
            treatRanges($ranges, rangeCaps, centerX, centerY, radius)

            // Enter
            let $newRanges = $ranges.data([null]).enter().append('line')
            let newRangeCaps = {}
            newRangeCaps.left = rangeCaps.left.data([null]).enter().append('line')
            newRangeCaps.right = rangeCaps.right.data([null]).enter().append('line')
            treatRanges($newRanges, newRangeCaps, centerX, centerY, radius)

            // Exit
            $ranges.exit().remove()
            rangeCaps.left.exit().remove()
            rangeCaps.right.exit().remove()
        }

        // Curves
        function treatSensitivityCurves(curves, lineData) {
            curves
                .attr('class', 'sensitivity')
                .attr('stroke', clrs.curveStroke)
                .attr('fill', clrs.curveFill)
                .attr('d', lineData)
        }

        function updateSensitivityCurve(wires, x, y) {

            let centerX = (x + (anchor * width)) * scale
            let rangePix = width * range * scale
            let radius = rangePix / 2
            let xLeft = centerX - radius
            let xRight = (centerX + radius)

            let binScale = d3.scaleLinear()
                .rangeRound([xLeft, xRight]);

            let bins = d3.histogram()
                .domain(binScale.domain())
                .thresholds(binScale.ticks(histTicks))
                (data);

            let binMax = Math.max(...bins.map(b => b.length))

            let xScale = d3.scaleLinear()
                .domain([bins[0].x0, bins[bins.length-1].x0])
                .range([xLeft, xRight])
            // Using the data max to fill height of frame
            let yScale = d3.scaleLinear()
                .domain([0, binMax])
                .range([upperHeight, 0])

            let lineFunction = d3.line()
                .x(d => xScale(d.x0))
                .y(d => yScale(d.length))
            let lineData = lineFunction(bins)

            // Update
            let $sensitivityCurves = wires.selectAll('path.sensitivity')
            treatSensitivityCurves($sensitivityCurves, lineData)

            // Enter
            let $newCurves = $sensitivityCurves.data([null]).enter().append('path')
            treatSensitivityCurves($newCurves, lineData)

            // Exit
            $sensitivityCurves.exit().remove()
        }

        // Anchors
        function treatAnchors(anchors) {
            anchors
                .attr('class', 'anchor')
                .attr('r', 3)
                .attr('cx', d => d[0])
                .attr('cy', d => d[1])
                .attr('fill', clrs.anchorFill)
                .attr('stroke', clrs.anchorStroke)
        }

        function updateAnchors(wires, x, y) {
            let bx = (x + (anchor * width)) * scale
            let by = y + barHeight / 2

            let $anchors = wires.selectAll('circle.anchor')
                .data([[bx, by]])
            treatAnchors($anchors)

            let $newAnchors = $anchors.enter().append('circle')
            treatAnchors($newAnchors)

            $anchors.exit().remove()
        }

        // Wires, which are groups of all the treatments above
        function treatWires(wires, x, y) {
            wires.attr('class', 'wire')
                .attr('id', d => 'wire-' + d)
                .attr('transform', d => {
                    let xTransform = width * scale * d
                    return 'translate(' + xTransform + ',0)'
                })
            updateAnchors(wires, x, y)
            updateRange(wires, x, y)
            updateSensitivityCurve(wires, x, y)
        }

        // Update the entire display, should be called on UI value change or on
        // animation frame update
        function updateDisplay() {
            let repetitions = d3.range(-1, Math.ceil(1 / scale) + 1)
            let x = 0
            let y = upperHeight

            // Update
            let $wires = $wireGroup.selectAll('g.wire')
                .data(repetitions)
            treatWires($wires, x, y)

            // Enter
            let $newWires = $wires.enter().append('g')
            treatWires($newWires, x, y)

            // Exit
            $wires.exit().remove()

            // Update sliders
            $anchorSlider.val(anchor * 100)
            $rangeSlider.val(range * 100)
            $scaleSlider.val(scale * 100)
            $independentVarsSlider.val(independentVariables)
        }

        // Called when new location data arrives
        function processLocation(x) {
            let fireProbability = getFireProbability(x)
            if (Math.random() >= fireProbability) {
                console.log('fire(%s)', x)
            }
        }
        function getFireProbability(x) {
            console.log(x)
            let anchors = $wireGroup.selectAll('circle.anchor')
            let fields = anchors.nodes().map(a => parseInt(a.getAttribute('cx')))
            console.log(fields)
            return 1.0
        }

        // This is the input from the user. Values change and the display updates.
        $('#' + elId + ' input').on('input', () => {
            anchor = parseInt($anchorSlider.val()) / 100
            range = parseInt($rangeSlider.val()) / 100
            scale = parseInt($scaleSlider.val()) / 100
            independentVariables = parseInt($independentVarsSlider.val())
            data = createDistribution()
            updateDisplay()
        })

        // On mouseover the bar, decide whether to fire.
        $barGroup.on('mousemove', () => {
            let mouse = d3.mouse($barGroup.node())
            let mousex = mouse[0]
            processLocation(mousex)
            updateDisplay()
        })

        updateDisplay()

    })
}
