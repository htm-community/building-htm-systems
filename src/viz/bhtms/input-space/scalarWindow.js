let RelativeScalarEncoder = require('RelativeScalarEncoder')
let CyclicCategoryEncoderDisplay = require('CyclicCategoryEncoderDisplay')
let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./scalarWindow.tmpl.html')

const onColor = 'skyblue'
const offColor = 'white'
let jsds = JSDS.create()

module.exports = (elementId) => {

    let encoder
    let n = 100
    let range = 0.5
    let min = -1.25
    let max = 1.25

    let jsdsHandles = []

    let timeStep = 60 * 60000 // minutes
    let dataStep = 0.25
    let counter = 0
    let timeMarker = new Date(new Date().setFullYear(new Date().getFullYear() - 1))

    let timeEncoders = {}

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

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId)

        let width = 560,
            height = 140

        let chartHeight = 120,
            chartPadding = 30

        let $svg = $d3El.select('svg')
            .attr('width', width)
            .attr('height', height)

        let windowSize = 100
        let index = 40

        let scaleX = d3.scaleLinear().domain([0, windowSize])
            .range([0, width])
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

        function drawEncoding(encoding) {
            let topMargin = chartHeight
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

            rects.on('mouseenter', (bit, index) => {
                jsds.set('selectedOutputBit', {state: bit, index: index})
            })
            $svg.on('mouseout', () => {
                $svg.select('g.hover').attr('visibility', 'hidden')
            })

            while (jsdsHandles.length) {
                jsdsHandles.pop().remove()
            }
        }

        function renderTimeCycles() {
            let size = 135

            let params = [{
                // day of month
                buckets: 31,
                range: 9,
                bits: 21,
                color: 'red',
            }, {
                // weekend
                buckets: 2,
                range: 11,
                bits: 21,
                color: 'green',
            }, {
                // day of week
                buckets: 7,
                range: 3,
                bits: 21,
                color: 'yellow',
            }, {
                // time of day
                buckets: 24,
                range: 9,
                bits: 21,
                color: 'blue',
            }]

            let names = [
                'day-of-month',
                'weekend',
                'day-of-week',
                'time-of-day',
            ]

            names.forEach((name, i) => {
                let prms = params[i]
                prms.size = size
                let encoderDisplay = new CyclicCategoryEncoderDisplay(name, prms)
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
            timeEncoders['day-of-month'].jsds.set('value', time.getDate())
            timeEncoders['weekend'].jsds.set('value', isWeekend)
            timeEncoders['day-of-week'].jsds.set('value', dayOfWeek)
            timeEncoders['time-of-day'].jsds.set('value', hourOfDay)
        }

        function updateValue(value) {
            updateValueDisplays(value)
            jsds.set('encoding', encoder.encode(value.value))
            updateTimeEncoders(value.time)
        }

        function updateValueDisplays(value) {
            $svg.select('circle#value-dot')
                .attr('cx', scaleX(index))
                .attr('cy', scaleY(value.value))
                .attr('r', 3)
                .attr('fill', 'red')
                .attr('stroke', 'red')
            $svg.select('text#label')
                .attr('x', scaleX(index) + 10)
                .attr('y', chartHeight - 10)
                .attr('stroke', 'black')
                .attr('fill', 'black')
                .attr('font-size', '12pt')
                .html(utils.precisionRound(value.value, 2) + ' ' + value.time)
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
                .attr('d', lineFunction(data.map(d => d.value)))
                .attr('stroke', 'black')
                .attr('fill', 'none')
            $svg.select('rect#index')
                .attr('x', scaleX(index))
                .attr('y', 0)
                .attr('height', chartHeight)
                .attr('width', 1)
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('opacity', 0.5)
            jsds.set('value', data[index])
        })

        jsds.set('data', fillWindowWithData([], windowSize))

        jsds.after('set', 'value', updateValue)

        jsds.after('set', 'encoding', drawEncoding)

        encoder = new RelativeScalarEncoder(n, range, min, max, bounded=true)

        renderTimeCycles()

        startTimer(50)

    })

}
