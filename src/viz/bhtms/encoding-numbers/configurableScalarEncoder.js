let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./configurableScalarEncoder.tmpl.html')
let dat = require('dat.gui')
let ScalarEncoder = require('ScalarEncoder')
let BoundedScalarEncoder = require('BoundedScalarEncoder')

function renderSimpleNumberEncoder(elementId, config) {

    const onColor = 'skyblue'
    const offColor = 'white'
    let uiValues = {}

    let jsds = JSDS.create('configurableScalarEncoder-' + elementId)

    function setupDatGui($el, cfg, onChange) {
        let gui = new dat.GUI({
            autoPlace: false,
        })
        Object.keys(cfg).forEach(propName => {
            let value = cfg[propName]
            let args = [uiValues, propName]
            if (Array.isArray(value)) {
                let step
                if (typeof(value[0]) === 'number') {
                    let min = value[0],
                        start = value[1],
                        max = value[2]
                    step = value[3]
                    args.push(min)
                    args.push(max)
                    uiValues[propName] = start
                } else if (typeof(value[0]) === 'string') {
                    args.push(value)
                    uiValues[propName] = value[0]
                }
                let item = gui.add.apply(gui, args).onChange(value => {
                    uiValues[propName] = value
                    onChange()
                })
                if (step) {
                    item.step(step)
                }
            } else {
                uiValues[propName] = value
            }
        })
        $el.append(gui.domElement)
    }

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId),
            $jqEl = $('#' + elementId),
            $datGui = $jqEl.find('.dat-gui')

        let width = 560,
            height = 140

        let jsdsHandles = []

        let valueScaleTopMargin = 40,
            valueScaleSideMargins = 10

        let $svg = $d3El.select('svg')
            .attr('width', width)
            .attr('height', height)

        let valueToX
        let xToValue

        let encoder

        function setUpValueAxis(min, max, maxWidth) {
            // console.log('Setting up value axis from %s to %s', min, max)
            let width = maxWidth - valueScaleSideMargins * 2
            let x = valueScaleSideMargins, y = valueScaleTopMargin
            valueToX = d3.scaleLinear()
                .domain([min, max])
                .range([0, width])
            xToValue = d3.scaleLinear()
                .domain([0, width])
                .range([min, max])
            let xAxis = d3.axisBottom(valueToX)
            let treatAxis = (axis) => {
                axis.attr('class', 'axis')
                    .attr('transform', 'translate(' + x + ',' + y + ')')
                    .call(xAxis)
            }
            let $axis = $svg.selectAll('g.axis').data([null])
            treatAxis($axis)
            let $newAxis = $axis.enter().append('g')
            treatAxis($newAxis)
            $axis.exit().remove()
            $svg.on('mousemove', () => {
                let mouse = d3.mouse($svg.node())
                if (mouse[1] > 80) return
                let mouseX = mouse[0] - valueScaleSideMargins
                mouseX = Math.min(maxWidth - (valueScaleSideMargins * 2), mouseX)
                mouseX = Math.max(0, mouseX)
                value = utils.precisionRound(xToValue(mouseX), 1)
                jsds.set('value', value)
            })
        }

        function updateOutputBits(encoding, maxWidth) {
            let topMargin = 80
            let padding = 30
            let bits = encoding.length
            let width = maxWidth - (padding * 2)
            let bitsToOutputDisplay = d3.scaleLinear()
                .domain([0, bits])
                .range([0, width])
            let cellWidth = Math.floor(width / bits)
            let cellHeight = 30
            let $outputGroup = $svg.select('g.encoding')
            let $hoverGroup = $svg.select('g.range')

            function treatCellRects(r) {
                r.attr('class', 'bit')
                    .attr('fill', (d) => {
                        if (d) return onColor
                        else return offColor
                    })
                    .attr('stroke', 'darkgrey')
                    .attr('stroke-width', 0.5)
                    .attr('fill-opacity', 1)
                    .attr('x', function(d, i) {
                        return bitsToOutputDisplay(i)
                    })
                    .attr('y', padding)
                    .attr('width', cellWidth)
                    .attr('height', cellHeight)
            }

            // Update
            let rects = $outputGroup.selectAll('rect.bit').data(encoding)
            treatCellRects(rects)

            // Enter
            let newRects = rects.enter().append('rect')
            treatCellRects(newRects)

            // Exit
            rects.exit().remove()

            $outputGroup
                .attr('transform', 'translate(' + padding + ',' + topMargin + ')')

            rects = $outputGroup.selectAll('rect.bit')

            let lineFunction = d3.line()
                .x(function(d) { return d.x; })
                .y(function(d) { return d.y; })
                .curve(d3.curveCatmullRom.alpha(0.5));

            function getRangeFromBitIndex(i, encoder) {
                let v = encoder.reverseScale(i),
                    w = encoder.w,
                    res = encoder.resolution,
                    min = encoder.min,
                    max = encoder.max,
                    radius = w * res / 2,
                    left = Math.max(min, v - radius),
                    right = Math.min(max, v + radius)
                // Keeps the bucket from changing size at min/max values
                if (encoder.bounded) {
                    if (left < (min + radius)) left = min
                    if (right > (max - radius)) right = max
                }
                return [left, right]
            }

            function hoverRange() {
                let selectedOutputBit = jsds.get('selectedOutputBit')
                let index = selectedOutputBit.index
                let cx = padding + bitsToOutputDisplay(index) + (cellWidth / 2)
                let cy = topMargin + 30
                let valueRange = getRangeFromBitIndex(index, encoder)
                $hoverGroup.select('g.range circle')
                    .attr('r', cellWidth / 2)
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('fill', 'royalblue')
                let leftValueBound = Math.max(encoder.min, valueRange[0]),
                    rightValueBound = Math.min(encoder.max, valueRange[1])
                let leftLineData = []
                let rightLineData = []
                leftLineData.push({x: cx, y: cy})
                rightLineData.push({x: cx, y: cy})
                let nearX = valueScaleSideMargins + valueToX(leftValueBound)
                let farX = valueScaleSideMargins + valueToX(rightValueBound)
                // Intermediary points for curving
                leftLineData.push({
                    x: cx - 10,
                    y: cy - 20,
                })
                leftLineData.push({
                    x: nearX,
                    y: valueScaleTopMargin + 20
                })
                rightLineData.push({
                    x: cx + 10,
                    y: cy - 20,
                })
                rightLineData.push({
                    x: farX,
                    y: valueScaleTopMargin + 20
                })

                // Point on value line
                leftLineData.push({
                    x: nearX,
                    y: valueScaleTopMargin
                })
                rightLineData.push({
                    x: farX,
                    y: valueScaleTopMargin
                })
                $hoverGroup.select('path.left')
                    .attr('d', lineFunction(leftLineData))
                    .attr('stroke', 'black')
                    .attr('fill', 'none')
                $hoverGroup.select('path.right')
                    .attr('d', lineFunction(rightLineData))
                    .attr('stroke', 'black')
                    .attr('fill', 'none')
                $hoverGroup.attr('visibility', 'visible')
            }

            rects.on('mouseenter', (bit, index) => {
                jsds.set('selectedOutputBit', {state: bit, index: index})
            })

            while (jsdsHandles.length) {
                jsdsHandles.pop().remove()
            }

            let setBitHandle = jsds.after('set', 'selectedOutputBit', hoverRange)
            let setResHandle = jsds.after('set', 'param-update', () => {
                let selectedBit = jsds.get('selectedOutputBit')
                if (selectedBit) hoverRange(selectedBit)
            })
            jsdsHandles.push(setBitHandle)
            jsdsHandles.push(setResHandle)
        }

        function updateValue(value) {
            let xOffset = valueScaleSideMargins,
                yOffset = valueScaleTopMargin,
                markerWidth = 1,
                markerHeight = 40

            let x = valueToX(value) - (markerWidth / 2)
            let y = 0 - (markerHeight / 2) - 6

            $svg.select('g.value text')
                .attr('x', x - 6)
                .attr('y', y)
                .attr('font-family', 'sans-serif')
                .attr('font-size', '10pt')
                .text(value)
            let spacing = 7
            $svg.select('g.value rect')
                .attr('stroke', 'red')
                .attr('stroke-width', 1.5)
                .attr('fill', 'none')
                .attr('width', markerWidth)
                .attr('height', markerHeight)
                .attr('x', x)
                .attr('y', y + spacing)

            $svg.select('g.value')
                .attr('transform', 'translate(' + xOffset + ',' + yOffset + ')')
        }

        function updateDisplays(encoding, value) {
            updateOutputBits(encoding, width)
            if (value) updateValue(value)
        }

        function createEncoder() {
            if (uiValues.bounded) {
                encoder = new BoundedScalarEncoder(uiValues)
            } else {
                encoder = new ScalarEncoder(uiValues)
            }
        }

        function render() {
            let value = jsds.get('value')
            createEncoder()
            let encoding = encoder.encode(value)
            setUpValueAxis(encoder.min, encoder.max, width)
            updateDisplays(encoding, value)
        }

        // When a new value is set, render
        jsds.after('set', 'value', () => {
            render()
        })

        // Start Program
        setupDatGui($datGui, config, render)
        createEncoder()
        jsds.set('value', (encoder.max - encoder.min) / 2)
    })

}

module.exports = renderSimpleNumberEncoder
