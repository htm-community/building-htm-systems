let RelativeScalarEncoder = require('RelativeScalarEncoder')
let JSDS = require('JSDS')
let utils = require('../utils')
let html = require('./scalarWindow.tmpl.html')

const onColor = 'skyblue'
const offColor = 'white'
let jsds = JSDS.create()

module.exports = (elementId) => {

    let encoder
    let n = 100
    let min = -1.25
    let max = 1.25

    let jsdsHandles = []

    let dataStep = 0.25
    let counter = 0
    function nextSemiRandomSineWaveDataPoint() {
        let x = counter
        counter += dataStep
        let value = Math.sin(x)
        let jitter = utils.getRandomArbitrary(0.0, 0.25)
        if (Math.random() > 0.5) value += jitter
        else value -= jitter
        return value
    }

    function fillWindowWithData(window, size) {
        while (window.length < size) {
            window.push(nextSemiRandomSineWaveDataPoint())
        }
        return window
    }

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId)

        let width = 560,
            height = 220

        let chartHeight = 200,
            chartPadding = 30

        let $svg = $d3El.select('svg')
            .attr('width', width)
            .attr('height', height)

        let $resolutionSlider = $('#windowRes'),
            $resolutionValues = $('.windowRes'),
            $speedSlider = $('#speed')

        let windowSize = 100
        let index = 40

        let scaleX = d3.scaleLinear().domain([0, windowSize]).range([0, width])
        let scaleY = d3.scaleLinear().domain([1, -1]).range([chartPadding, chartHeight - chartPadding])
        let lineFunction = d3.line()
            .x(function(d, i) {
                return scaleX(i)
            })
            .y(function(d, i) {
                return scaleY(d)
            })
            .curve(d3.curveCatmullRom.alpha(0.01))
        let rectWidth = 20

        function drawEncoding(encoding) {
            let topMargin = 200
            let bitsToOutputDisplay = d3.scaleLinear()
                .domain([0, encoding.length])
                .range([0, width])
            let cellWidth = Math.floor(width / encoding.length)
            let $outputGroup = $svg.select('g.encoding')
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
                    .attr('y', 0)
                    .attr('width', cellWidth)
                    .attr('height', cellWidth * 4)
            }

            // Update
            let rects = $outputGroup.selectAll('rect.bit').data(encoding)
            treatCellRects(rects)

            // Enter
            let newRects = rects.enter().append('rect')
            treatCellRects(newRects)

            // Exit
            rects.exit().remove()

            $outputGroup.attr('transform', 'translate(0, ' + topMargin + ')')

            rects = $outputGroup.selectAll('rect.bit')

            function hoverRange(selectedOutputBit) {
                let index = selectedOutputBit.index
                let [low, high] = encoder.getRangeFromBitIndex(index)
                let scaledBottom = scaleY(low)
                let scaledTop = scaleY(high)
                let height = scaledBottom - scaledTop
                let $hover = $svg.select('g.hover')
                    .attr('visibility', 'visible')
                $hover.select('rect.range')
                    .attr('x', 0)
                    .attr('width', width)
                    .attr('y', scaledTop)
                    .attr('height', height)
                    .attr('stroke', 'red')
                    .attr('fill', 'orange')
                    .attr('opacity', 0.2)
            }

            rects.on('mouseenter', (bit, index) => {
                jsds.set('selectedOutputBit', {state: bit, index: index})
            })
            $svg.on('mouseout', () => {
                $svg.select('g.hover').attr('visibility', 'hidden')
            })

            while (jsdsHandles.length) {
                jsdsHandles.pop().remove()
            }

            let setBitHandle = jsds.after('set', 'selectedOutputBit', hoverRange)
            let setResHandle = jsds.after('set', 'resolution', () => {
                let selectedBit = jsds.get('selectedOutputBit')
                if (selectedBit) hoverRange(selectedBit)
            })
            jsdsHandles.push(setBitHandle)
            jsdsHandles.push(setResHandle)
        }

        function updateValue(value) {
            updateValueDisplays(value)
            jsds.set('encoding', encoder.encode(value))
        }

        function updateValueDisplays(value) {

            let radius = jsds.get('resolution') / 2
            let low = Math.max(min, value - radius)
            let high = Math.min(max, value + radius)
            let scaledBottom = scaleY(low)
            let scaledTop = scaleY(high)
            let rectHeight = scaledBottom - scaledTop

            $svg.select('rect#value')
                .attr('x', scaleX(index) - rectWidth/2)
                .attr('y', scaledTop)
                .attr('height', rectHeight)
                .attr('width', rectWidth)
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
                .attr('fill', 'red')
                .attr('opacity', 0.2)
            $svg.select('circle#value-dot')
                .attr('cx', scaleX(index))
                .attr('cy', scaleY(value))
                .attr('r', 2)
                .attr('fill', 'red')
                .attr('stroke', 'none')
            $svg.select('text#label')
                .attr('x', scaleX(index) + 20)
                .attr('y', 190)
                .attr('stroke', 'black')
                .attr('fill', 'black')
                .attr('font-size', '12pt')
                .html(utils.precisionRound(value, 2))
        }

        function startTimer(speed) {
            // If speed is larger than .5 second, we'll assume they just want to stop.
            if (speed >= 500) speed = 99999999
            return setInterval(() => {
                let data = jsds.get('data')
                data.push(nextSemiRandomSineWaveDataPoint())
                data.shift()
                jsds.set('data', data)
            }, speed)
        }

        jsds.after('set', 'data', (data) => {
            $svg.select('path#plot')
                .attr('d', lineFunction(data))
                .attr('stroke', 'black')
                .attr('fill', 'none')
            $svg.select('rect#index')
                .attr('x', scaleX(index) - rectWidth/2)
                .attr('y', 0)
                .attr('height', 200)
                .attr('width', rectWidth)
                .attr('stroke', 'red')
                .attr('stroke-width', 1)
                .attr('fill', 'none')
                .attr('opacity', 0.25)
            jsds.set('value', data[index])
        })

        jsds.set('data', fillWindowWithData([], windowSize))

        jsds.after('set', 'value', updateValue)

        jsds.after('set', 'encoding', drawEncoding)

        jsds.after('set', 'resolution', (resolution) => {
            encoder = new RelativeScalarEncoder(n, resolution, min, max, bounded=true)
            let value = jsds.get('value')
            updateValue(value)
            $resolutionValues.html(resolution)
        })

        $resolutionSlider.on('input', () => {
            let res = parseInt($resolutionSlider.val()) / 100
            jsds.set('resolution', res)
        })

        $speedSlider.on('input', () => {
            clearInterval(timerHandle)
            let speed = parseInt($speedSlider.val())
            timerHandle = startTimer(speed)
        })

        let speed = parseInt($speedSlider.val())
        let timerHandle = startTimer(speed)

        let res = parseInt($resolutionSlider.val()) / 100
        jsds.set('resolution', res)

    })

}
