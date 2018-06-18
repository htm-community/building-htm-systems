let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./weekendEncoder.tmpl.html')
let moment = require('moment')
let WeekendEncoder = require('WeekendEncoder')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let valueScaleTopMargin = 40
        let valueScaleSideMargins = 40
        let topOfOutput = 70

        let width = 560
        let height = 140

        let jsds = JSDS.create('weekend-encoder')

        let days = moment.weekdaysShort()

        let $d3El = d3.select('#' + elementId)

        let $svg = $d3El.select('svg')
            .attr('width', width)
            .attr('height', height)

        let encoder = new WeekendEncoder({w: 30})


        function setUpValueAxis($svg, maxWidth) {
            let width = maxWidth - valueScaleSideMargins * 2
            let xStart = valueScaleSideMargins
            let xEnd = width - valueScaleSideMargins
            let y = valueScaleTopMargin

            let xScale = d3.scalePoint()
                .domain(days)
                .range([xStart, xEnd])
            let reverseScale = d3.scaleLinear()
                .domain([xStart, xEnd])
                .range([0, days.length])

            let xAxis = d3.axisTop(xScale).ticks(days.length)

            $svg.append('g')
                .attr('transform', 'translate(' + xStart + ',' + y + ')')
                .call(xAxis)
            $svg.on('mousemove', () => {
                let mouse = d3.mouse($svg.node())
                if (mouse[1] > 80) return
                let mouseX = mouse[0] - valueScaleSideMargins
                mouseX = Math.min(maxWidth - (valueScaleSideMargins * 2), mouseX)
                mouseX = Math.max(0, mouseX)
                dayOfWeekIndex = parseInt(Math.floor(reverseScale(mouseX)))
                let dayOfWeek = days[dayOfWeekIndex]
                if (dayOfWeek !== undefined) {
                    let date = moment().day(dayOfWeek)
                    jsds.set('value', date.toDate())
                }
            })
        }

        function updateValue(value) {
            let myWidth = width - valueScaleSideMargins * 2
            let xStart = valueScaleSideMargins
            let xEnd = myWidth - valueScaleSideMargins
            let xOffset = valueScaleSideMargins
            let yOffset = valueScaleTopMargin
            let markerWidth = 30
            let markerHeight = 50
            let dayOfWeek = moment(value).format('ddd')

            let valueToX = d3.scalePoint()
                .domain(days).range([xStart, xEnd])

            let x = valueToX(dayOfWeek) - (markerWidth / 2)
            let y = 0 - (markerHeight / 2) - 6
            let spacing = -7
            $svg.select('g.value rect')
                .attr('stroke', 'orange')
                .attr('stroke-width', 2.2)
                .attr('fill', 'none')
                .attr('width', markerWidth)
                .attr('height', markerHeight)
                .attr('x', x)
                .attr('y', y + spacing)

            $svg.select('g.value')
                .attr('transform', 'translate(' + xOffset + ',' + yOffset + ')')
        }

        function updateOutputBits(encoding) {
            let myWidth = width - (valueScaleSideMargins * 2)
            let $group = $d3El.select('g.encoding')
            let xLeft = valueScaleSideMargins
            let xRight = width - valueScaleSideMargins
            let rectWidth = myWidth / encoding.length
            let rectHeight = 30
            let xScale = d3.scaleLinear()
                .domain([0, encoding.length])
                .range([xLeft, xRight])

            function treatRects(rects) {
                rects
                    .attr('stroke', 'grey')
                    .attr('stroke-width', '.5px')
                    .attr('fill', d => {
                        let out = 'white'
                        if (d === 1) out = 'skyblue'
                        return out
                    })
                    .attr('x', (d, i) => {
                        return xScale(i)
                    })
                    .attr('y', topOfOutput)
                    .attr('width', rectWidth)
                    .attr('height', rectHeight)
            }

            let rects = $group.selectAll('rect.bit').data(encoding)
            treatRects(rects)

            let newRects = rects.enter().append('rect')
            treatRects(newRects)

            rects.exit().remove()
        }

        setUpValueAxis($svg, width)

        // Once an encoding is set, we can draw.
        jsds.after('set', 'encoding', (encoding) => {
            updateOutputBits(encoding)
        })

        // When a new value is set, it should be encoded.
        jsds.after('set', 'value', (v) => {
            updateValue(v)
            jsds.set('encoding', encoder.encode(v))
        })

        jsds.set('value', new Date())

    })

}
