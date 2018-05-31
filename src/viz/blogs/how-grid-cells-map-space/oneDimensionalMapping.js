let utils = require('../../../lib/utils')
let html = require('./oneDimensionalMapping.tmpl.html')
let JSDS = require('JSDS')

let clrs = {
    barFill: 'lightgrey',
    barStroke: 'grey',
    curveFill: 'salmon',
    curveStroke: 'red',
    anchorStroke: 'black',
    anchorFill: 'none',
    rangeStroke: 'black'
}

let jsds = JSDS.create('1-d-mapping')
let startingParams = {
    anchor: 0.5,
    range: 1,
    scale: 1,
    independentVars: 5,
}

let moduleOut = (elId) => {
    utils.loadHtml(html.default, elId, () => {

        let width = 450
        let height = 100

        let upperHeight = 40
        let barHeight = 30
        let histTicks = 50
        let spikeHistory = 100 // number of spikes to show
        let spikeMouseDelay = 50 // ms

        let lastMouseEvent = new Date().getTime()

        let $anchorSlider = $('#anchorPerc')
        let $rangeSlider = $('#rangePerc')
        let $scaleSlider = $('#scalePerc')
        let $independentVarsSlider = $('#independentVars')

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
        let data = createDistribution(independentVars)

        function createDistribution(independentVars) {
            let out = d3.range(50000)
                .map(d3.randomBates(independentVars))
                .map((val, i) => {
                    return val - 0.5
                })
            let equalizer = d3.scaleLinear()
                .domain([Math.min(...out), Math.max(...out)])
                .range([0, 1])
            out = out.map(d => equalizer(d))
            return out.sort()
        }

        //
        // Treatments and updates
        //

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

        function updateAnchors(wires, bx, by) {

            let $anchors = wires.selectAll('circle.anchor')
                .data([[bx, by]])
            treatAnchors($anchors)

            let $newAnchors = $anchors.enter().append('circle')
            treatAnchors($newAnchors)

            $anchors.exit().remove()
        }

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

        function updateRange($wires, radius, centerX, centerY) {

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

        function updateSensitivityCurve(wires, centerX, radius) {
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

        // Wires, which are groups of all the treatments above
        function treatWires(wires, params, x, y) {
            let centerX = (x + (params.anchor * width)) * params.scale
            let centerY = y + barHeight / 2

            wires.attr('class', 'wire')
                .attr('id', d => 'wire-' + d)
                .attr('transform', d => {
                    let xTransform = width * params.scale * d
                    return 'translate(' + xTransform + ',0)'
                })
            let rangePix = width * params.range * params.scale
            let radius = rangePix / 2
            updateAnchors(wires, centerX, centerY)
            updateRange(wires, radius, centerX, centerY)
            updateSensitivityCurve(wires, centerX, radius)
        }

        function treatSpikes(spikes) {
            spikes.attr('class', 'spike')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', 3)
                .attr('stroke', 'navy')
                .attr('stroke-width', '1px')
                .attr('fill', 'none')
        }

        // Mouseover spike points: points displayed on the 1D bar where grid cell
        // has fired as user moused over the bar.
        function updateSpikes() {
            // Update
            let $spikes = $svg.selectAll('circle.spike')
                .data(jsds.get('spikes'))
            treatSpikes($spikes)

            // Enter
            let $newSpikes = $spikes.enter().append('circle')
            treatSpikes($newSpikes)

            // Exit
            $spikes.exit().remove()
        }

        // Update the entire display, should be called on UI value change or on
        // animation frame update
        function updateDisplay() {
            let params = jsds.get('params')
            // Bail out if params haven't been loaded.
            if (! params) return;
            let repetitions = d3.range(-1, Math.ceil(1 / params.scale) + 1)
            let x = 0
            let y = upperHeight

            // Update
            let $wires = $wireGroup.selectAll('g.wire')
                .data(repetitions)
            treatWires($wires, params, x, y)

            // Enter
            let $newWires = $wires.enter().append('g')
            treatWires($newWires, params, x, y)

            // Exit
            $wires.exit().remove()

            // Update the spikes on the 1D bar
            updateSpikes()

            // Update sliders
            $anchorSlider.val(params.anchor * 100)
            $rangeSlider.val(params.range * 100)
            $scaleSlider.val(params.scale * 100)
            $independentVarsSlider.val(params.independentVars)
        }

        // Called when new location data arrives
        function processLocation(x, y) {
            let prob = getFireProbability(x)
            if (Math.random() <= prob) {
                let spikes = jsds.get('spikes')
                spikes.push({
                    x: x, y: upperHeight + barHeight / 2
                })
                if (spikes.length > spikeHistory) spikes.shift()
                jsds.set('spikes', spikes)
            }
        }

        /*
         * FIXME:
         * I know it is weird using the random bates data array as a way to
         * compute probabilities. I'm sure there's a better way, but I'm not
         * in a place to investigate right now.
         */
        function getProbability(left, right, x) {
            let center = Math.floor((right - left) / 2)
            let probScale
            if (x < center) {
                // scale left of center building up to 1.0
                probScale = d3.scaleLinear()
                    .domain([left, center]).range([0, data.length-1])
            } else {
                // scale right of center falling from 1.0
                probScale = d3.scaleLinear()
                    .domain([center, right]).range([data.length-1, 0])
            }
            let index = Math.floor(probScale(x))
            let value = data[index]
            return value
        }

        function getFireProbability(x) {
            // let anchors = $wireGroup.selectAll('circle.anchor')
            // let fields = anchors.nodes().map(a => parseInt(a.getAttribute('cx'))
            let transforms = $wireGroup.selectAll('g.wire').nodes()
                                .map(a => a.getAttribute('transform'))
            fields = transforms.map(str => {
                let [l, r] = str.split(',')
                let [trash, xstr] = l.split('(')
                return parseInt(xstr)
            })
            let params = jsds.get('params')
            let prob = 0.0
            let rangePix = width * params.range * params.scale
            let radius = rangePix / 2
            let anchorPix = width * params.scale * params.anchor
            // should only be in one field at a time in this example
            fields.forEach(f => {
                let left = f+anchorPix - radius
                let right = f+anchorPix + radius
                if (x > left && x < right) {
                    prob = getProbability(left, right, x)
                }
            })
            console.log(prob)
            return prob
        }

        // This is the input from the user. Values change and the display updates.
        $('#' + elId + ' input').on('input', () => {
            let params = {}
            params.anchor = parseInt($anchorSlider.val()) / 100
            params.range = parseInt($rangeSlider.val()) / 100
            params.scale = parseInt($scaleSlider.val()) / 100
            params.independentVars = parseInt($independentVarsSlider.val())
            jsds.set('params', params)
            jsds.set('spikes', [])
        })

        // On mouseover the bar, decide whether to fire.
        $barGroup.on('mousemove', () => {
            // Only process mouse moves every so often. It looks better on screen.
            if (new Date().getTime() > lastMouseEvent + spikeMouseDelay) {
                let mouse = d3.mouse($barGroup.node())
                processLocation(mouse[0], mouse[1])
                updateDisplay()
                lastMouseEvent = new Date().getTime()
            }
        })

        // When params are changed (by user most likely), we rebuild the data
        // and update the display
        jsds.after('set', 'params', () => {
            data = createDistribution(jsds.get('params').independentVars)
            updateDisplay()
        })
        jsds.after('set', 'spikes', updateDisplay)

        // A place to store spikes as uses mouse over the 1D bar.
        jsds.set('spikes', [])

        // This is what actually kicks off the program
        jsds.set('params', startingParams)

    })
}

// A hack to shove in more functionality without opening up the API.
moduleOut.setParams = (params) => {
    jsds.set('params', params)
}

module.exports = moduleOut
