let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./weekendEncoder.tmpl.html')

module.exports = (elementId) => {

    let valueScaleTopMargin = 40,
        valueScaleSideMargins = 10

    let width = 560,
        height = 180,
        minValue = 0,
        maxValue = 55,
        bits = 100,
        value = 'Sun'

    let days = [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ]

    let jsds = JSDS.create('weekend-encoder')

    let $svg

    function setUpValueAxis($svg, maxWidth) {
        let width = maxWidth - valueScaleSideMargins * 2
        let x = valueScaleSideMargins
        let y = valueScaleTopMargin
        let bandWidth = width / days.length
        let range = d3.range(0, width, bandWidth)
        let dayTable = {}

        let xScale = d3.scaleOrdinal()
            .domain(days).range(range)

        days.forEach((d, i) => {
            dayTable[xScale(d)] = d
        })

        let xAxis = d3.axisTop(xScale).ticks(days.length)
        $svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')')
            .call(xAxis)
        $svg.on('mousemove', () => {
            let mouse = d3.mouse($svg.node())
            if (mouse[1] > 80) return
            let mouseX = mouse[0] - valueScaleSideMargins
            mouseX = Math.min(maxWidth - (valueScaleSideMargins * 2), mouseX)
            mouseX = Math.max(0, mouseX)
            value = xScale(mouseX)
            console.log(dayTable[value])
            // jsds.set('value', value)
        })
    }

    function updateValue(value) {
        let xOffset = valueScaleSideMargins,
            yOffset = valueScaleTopMargin,
            markerWidth = 1,
            markerHeight = 40

        let valueToX = d3.scaleBand()
            .domain(days).range([0, width])

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

    function encode(string, bits) {
        let out = new Array(bits).map(() => {
            return 0
        })
        return out
    }

    function updateDisplays(encoding, value) {
        updateValue(value)
        // updateOutputBits(encoding, width)
    }

    function redraw() {
        updateDisplays(jsds.get(elementId + '-encoding'), jsds.get('value'))
    }

    utils.loadHtml(html.default, elementId, () => {

        let $d3El = d3.select('#' + elementId),
            $jqEl = $('#' + elementId)

        $svg = $d3El.select('svg')
            .attr('width', width)
            .attr('height', height)

        let encoder

        setUpValueAxis($svg, width)

        // Once an encoding is set, we can draw.
        jsds.after('set', elementId + '-encoding', redraw)

        // When a new value is set, it should be encoded.
        jsds.after('set', 'value', (v) => {
            jsds.set(elementId + '-encoding', encode(v, bits))
        })

    })

}
