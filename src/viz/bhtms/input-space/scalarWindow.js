let ScalarEncoder = require('ScalarEncoder')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')
let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./scalarWindow.tmpl.html')
let moment = require('moment')

let jsds = JSDS.create('scalar-window')

let speed = 300
let timerHandle

const onColor = '#555'
const offColor = 'white'

let timeEncoderNames = [
    'day-of-month',
    'weekend',
    'day-of-week',
    'time-of-day',
]
let timeEncoderParams = [{
    // day of month
    values: 31,
    range: 9,
    buckets: 21,
    color: '#DF0024',
}, {
    // weekend
    values: 2,
    range: 11,
    buckets: 21,
    color: '#00AC9F',
}, {
    // day of week
    values: 7,
    range: 3,
    buckets: 21,
    color: '#F3C300',
}, {
    // time of day
    values: 24,
    range: 9,
    buckets: 21,
    color: '#2E6DB4',
}]

let encoder
let scalarBits = 100
let range = 0.5
let min = -1.25
let max = 1.25

let jsdsHandles = []

let timeEncoders = {}

let timeStep = 60 * 60000 // minutes
let dataStep = 2 * Math.PI / 24 // radians
let counter = 0
let timeMarker = new Date(new Date().setFullYear(new Date().getFullYear() - 1))

function nextSemiRandomSineWaveDataPoint() {
    let x = counter
    counter += dataStep
    let value = Math.sin(x)
    let jitter = utils.getRandomArbitrary(0.0, 0.25)
    if (Math.random() > 0.5) value += jitter
    else value -= jitter
    timeMarker = new Date(timeMarker.getTime() + timeStep)
    // I could add artificial temporal patterns here.
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

        let combinedHeight = 290
        let $combinedEncoding = $d3El.select('svg#combined-encoding')
            .attr('width', width)
            .attr('height', combinedHeight)


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

            while (jsdsHandles.length) {
                jsdsHandles.pop().remove()
            }
        }

        function renderTimeCycles() {
            let size = 135

            timeEncoderNames.forEach((name, i) => {
                let prms = timeEncoderParams[i]
                prms.size = size
                let encoderDisplay = new CyclicEncoderDisplay(name, prms)
                encoderDisplay.render()
                timeEncoders[name] = encoderDisplay
                encoderDisplay.jsds.set('value', 0)
            })
        }

        function updateTimeEncoders(time) {
            let dayOfWeek = time.getDay()
            let isWeekend = 0
            let hourOfDay = time.getHours()
            if ((dayOfWeek === 6) || (dayOfWeek === 0)) {
                isWeekend = 1
            }

            timeEncoders['day-of-month'].jsds.set('value', time.getDate() - 1)
            timeEncoders['weekend'].jsds.set('value', isWeekend)
            timeEncoders['day-of-week'].jsds.set('value', dayOfWeek)
            timeEncoders['time-of-day'].jsds.set('value', hourOfDay)
        }

        function _treatCombinedEncodingBits(rects) {
            let cellsPerRow = 19,
                size = Math.round(width / cellsPerRow),
                leftPad = 2
            rects.attr('class', 'combined')
                .attr('x', (d, i) => {
                    return leftPad + size * (i % cellsPerRow)
                })
                .attr('y', (d, i) => {
                    return Math.floor(i / cellsPerRow) * size
                })
                .attr('width', size)
                .attr('height', size)
                .attr('stroke', 'darkgrey')
                .attr('stroke-width', 0.5)
                .attr('fill', (d, i) => {
                    let typeIndex = timeEncoderNames.indexOf(d.encoder)
                    let color = offColor
                    if (typeIndex < 0 && d.bit === 1) {
                        color = onColor
                    } else if (d.bit === 1) {
                        color = timeEncoderParams[typeIndex].color
                    }
                    return color
                })
        }

        function updateCombinedEncoding() {
            let combinedEncoding = []
            let scalarBits = jsds.get('scalar-encoding')
            scalarBits.forEach((bit, i) => {
                combinedEncoding.push({
                    bit: bit,
                    encoder: 'relative-scalar',
                })
            })
            Object.keys(timeEncoders).forEach(k => {
                // Each encoder has a specific jsds instance
                let encoding = timeEncoders[k].jsds.get('encoding')
                encoding.forEach(bit => {
                    combinedEncoding.push({
                        bit: bit,
                        encoder: k,
                    })
                })
            })

            let $rects = $combinedEncoding.selectAll('rect.combined')
                            .data(combinedEncoding)
            _treatCombinedEncodingBits($rects)

            let $newRects = $rects.enter().append('rect')
            _treatCombinedEncodingBits($newRects)

            $rects.exit().remove()
        }

        function updateValue(value) {
            updateValueDisplays(value)
            jsds.set('scalar-encoding', encoder.encode(value.value))
            updateTimeEncoders(value.time)
            updateCombinedEncoding()
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

        encoder = new ScalarEncoder({
            w: range, n: scalarBits, min: min, max: max, bounded: true
        })

        renderTimeCycles()

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
