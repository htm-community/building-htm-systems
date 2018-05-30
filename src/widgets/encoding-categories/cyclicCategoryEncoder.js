let JSDS = require('JSDS')
let utils = require('../utils')
let html = require('./cyclicCategoryEncoder.tmpl.html')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitOn: 'orange',
    bitStroke: 'black'
}

module.exports = (elementId, bounded=false) => {

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId),
            $jqEl = $('#' + elementId),
            $svg = $d3El.select('svg')

        let jsds = JSDS.create('cyclic-category-encoder-' + elementId)

        let size = 300,
            minValue = 0,
            maxValue = 6,
            bits = 12,
            value = 2,
            range = 3,
            radius = (size / 2) * 3/4

        let $minDisplay = $jqEl.find('.min-display'),
            $valueDisplay = $jqEl.find('.value-display'),
            $maxDisplay = $jqEl.find('.max-display'),
            $rangeDisplay = $jqEl.find('.range-display'),
            $nameLabel = $jqEl.find('.name-label'),
            $minLabel = $jqEl.find('.min-label'),
            $valueLabel = $jqEl.find('.value-label'),
            $maxLabel = $jqEl.find('.max-label'),
            $rangeLabel = $jqEl.find('.range-label')

        let domainRange = d3.range(minValue, maxValue)
        let encodingRange = d3.range(0, bits)

        let scale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range([0, bits])

        function setupDom() {
            let half = size / 2
            $svg.attr('width', size)
                .attr('height', size)
            $svg.select('circle.track')
                .attr('cx', half)
                .attr('cy', half)
                .attr('r', radius)
                .attr('fill', 'none')
                .attr('stroke', colors.track)

            $nameLabel
                .attr('x', half)
                .attr('y', size * 1/3)
            $minLabel
                .attr('x', size * 1/3)
                .attr('y', half + 20)
            $valueLabel
                .attr('x', half)
                .attr('y', half + 20)
            $maxLabel
                .attr('x', size * 2/3)
                .attr('y', half + 20)
            $rangeLabel
                .attr('x', half)
                .attr('y', size * 2/3 + 20)

            $valueDisplay
                .attr('x', half)
                .attr('y', half)
            $valueLabel
                .attr('x', half)
                .attr('y', half)
            $minDisplay
                .attr('x', half / 2)
                .attr('y', half)
                .html(minValue)
            $maxDisplay
                .attr('x', size * 3/4)
                .attr('y', half)
                .html(maxValue)

            $rangeDisplay
                .attr('x', half)
                .attr('y', size * 2/3)
                .html(range + '/' + bits)

        }

        function updateValues(value) {
            $valueDisplay.html(value)
        }

        function treatCircleBits(circles) {
            circles
                .attr('cx', d => d.cx)
                .attr('cy', d => d.cy)
                .attr('r', radius / 8)
                .attr('fill', d => {
                    if (d.bit) return colors.bitOn
                    else return colors.bitOff
                })
                .attr('stroke', colors.bitStroke)
                .attr('stroke-width', 3)
        }

        function updateCircles(encoding) {
            let bucketSpread = (2 * Math.PI) / bits
            let center = {x: size / 2, y: size / 2}
            let data = encoding.map((bit, i) => {
                let theta = i * bucketSpread
                return {
                    bit: bit,
                    cx: center.x + radius * Math.sin(theta),
                    cy: center.y + radius * Math.cos(theta),
                }
            })
            let $group = $svg.selectAll('g.bits')
            let circles = $group.selectAll('circle').data(data)
            treatCircleBits(circles)

            let newCircles = circles.enter().append('circle')
            treatCircleBits(newCircles)

            circles.exit().remove()
        }

        function updateDisplay() {
            let value = jsds.get('value')
            let encoding = encode(value)
            updateValues(value)
            updateCircles(encoding)
        }

        function encode(value) {
            let out = []
            d3.range(0, bits).forEach(() => { out.push(0) })
            let index = scale(value)
            out[index] = 1
            for (let i = 0; i < range; i++) {
                let rangeIndex = index + i
                if (rangeIndex > out.length) {
                    rangeIndex -= out.length
                }
                out[rangeIndex] = 1
            }
            return out
        }

        setupDom()

        jsds.after('set', 'value', updateDisplay)

        let counter = minValue

        setInterval(() => {
            jsds.set('value', counter++)
            if (counter >= maxValue) counter = 0
        }, 300)

    })

}
