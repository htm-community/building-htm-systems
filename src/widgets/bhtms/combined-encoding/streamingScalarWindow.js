let BoundedScalarEncoder = require('BoundedScalarEncoder')
let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./streamingScalarWindow.tmpl.html')
let moment = require('moment')

let speed = 300
let timerHandle

const onColor = 'skyblue'
const offColor = 'white'

let encoder
let outputBits = 100
let w = 10
let min = -1.25
let max = 1.25

let timeStep = 60 * 60000 // minutes
let slicesPerPeriod = 24
let period = 2 * Math.PI
let dataStep = period / slicesPerPeriod // radians
let counter = 0
let timeMarker = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
let periods = 0

function nextSemiRandomSineWaveDataPoint() {
    let x = counter
    counter += dataStep
    let value = Math.sin(x)
    let jitter = utils.getRandomArbitrary(0.0, 0.25)
    if (Math.random() > 0.5) value += jitter
    else value -= jitter
    timeMarker = new Date(timeMarker.getTime() + timeStep)
    // I could add artificial temporal patterns here.
    if (counter > periods * period) periods++
    // Like this. I'll make every 3rd cycle different
    if (periods % 3 ===0) {
        value = Math.abs(value*1.5)
    }
    return {
        value: value,
        time: timeMarker,
    }
}

function fillWindowWithData(window, size) {
    while (window.length < size) {
        window.push(nextSemiRandomSineWaveDataPoint())
    }
    return window
}

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId)

        let jsds = JSDS.create('streamingScalarWindow-' + elementId)

        let width = 560,
            height = 140

        let chartHeight = 120,
            chartPadding = 30

        let $streamingScalar = $d3El.select('svg#streaming-scalar')
            .attr('width', width)
            .attr('height', height)
        let $plot = $streamingScalar.select('path#plot')

        let windowSize = 200
        let initialIndex = 40

        let scaleX = d3.scaleLinear().domain([0, windowSize])
            .range([0, width])
        let reverseScaleX = d3.scaleLinear().domain([0, width])
            .range([0, windowSize])
        let scaleY = d3.scaleLinear().domain([1, -1])
            .range([chartPadding, chartHeight - chartPadding])
        let lineFunction = d3.line()
            .x(function(d, i) {
                return scaleX(i)
            })
            .y(function(d, i) {
                return scaleY(d)
            })
            .curve(d3.curveCatmullRom.alpha(0.01))

        function drawScalarEncoding(encoding) {
            let topMargin = chartHeight
            let bitsToOutputDisplay = d3.scaleLinear()
                .domain([0, encoding.length])
                // the -2 is to account for the left and right border widths
                .range([0, width -2])
            let cellWidth = Math.floor(width / encoding.length)
            let $outputGroup = $streamingScalar.select('g.encoding')
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

            rects.on('mouseenter', (bit, index) => {
                jsds.set('selectedOutputBit', {state: bit, index: index})
            })
            $streamingScalar.on('mouseout', () => {
                $streamingScalar.select('g.hover').attr('visibility', 'hidden')
            })
        }

        function updateValue(value) {
            updateValueDisplays(value)
            jsds.set('scalar-encoding', encoder.encode(value.value))
        }

        function updateValueDisplays(value) {
            let index = jsds.get('index') || initialIndex
            let scaled = scaleX(index)
            $streamingScalar.select('circle#value-dot')
                .attr('cx', scaled)
                .attr('cy', scaleY(value.value))
                .attr('r', 3)
                .attr('fill', 'red')
                .attr('stroke', 'red')
            let dateString = moment(value.time).format('MMM Do YYYY ha')
            let formattedValue = utils.precisionRound(value.value, 2)
            let valueOut = formattedValue + ' ' + dateString
            $streamingScalar.select('text#label')
                .attr('x', scaled + 10)
                .attr('y', chartHeight - 10)
                .attr('stroke', 'black')
                .attr('fill', 'black')
                .attr('font-size', '12pt')
                .html(valueOut)
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

        function renderIndex(data) {
            let index = jsds.get('index') || initialIndex
            let scaled = scaleX(index)
            $streamingScalar.select('rect#index')
                .attr('x', scaled)
                .attr('y', 0)
                .attr('height', chartHeight)
                .attr('width', 1)
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('opacity', 0.5)
            jsds.set('value', data[index])
        }

        jsds.after('set', 'data', (data) => {
            $plot
                .attr('d', lineFunction(data.map(d => d.value)))
                .attr('stroke', 'black')
                .attr('fill', 'none')
            renderIndex(data)
        })

        jsds.set('data', fillWindowWithData([], windowSize))

        jsds.after('set', 'value', updateValue)

        jsds.after('set', 'scalar-encoding', drawScalarEncoding)

        jsds.after('set', 'index', () => {
            renderIndex(jsds.get('data'))
        })

        encoder = new BoundedScalarEncoder({
            w: w,
            n: outputBits,
            min: min,
            max: max,
        })

        $streamingScalar.on('mouseenter', () => {
            clearInterval(timerHandle)
        })
        $streamingScalar.on('mousemove', () => {
            let x = d3.mouse($plot.node())[0]
            let index = Math.round(reverseScaleX(x))
            jsds.set('index', index)
        })
        $streamingScalar.on('mouseleave', () => {
            timerHandle = startTimer(speed)
        })

        timerHandle = startTimer(speed)

    })

}
