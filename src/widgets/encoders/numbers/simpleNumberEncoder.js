let SdrUtils = require('SdrUtils')
let utils = require('../../utils')
let html = require('./simpleNumberEncoder.tmpl.html')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let width = 560,
            height = 300,
            minValue = 0,
            maxValue = 55,
            bits = 100,
            range = 5

        let axisPadding = 30

        let $svg = d3.select('#' + elementId).select('svg')
            .attr('width', width)
            .attr('height', height)

        function updateOutputBits(encoding) {

        }

        function updateValue(value, min, max, maxWidth) {
            let x = axisPadding, y = 0
            let axisScale = d3.scaleLinear()
                .domain([min, max])
                .range([0, width])

            let markerWidth = 10
                markerHeight = 30

            $svg.select('rect.value')
                .attr('stroke', 'red')
                .attr('stroke-width', 1.5)
                .attr('fill', 'none')
                .attr('width', markerWidth)
                .attr('height', markerHeight)
                .attr('x', axisScale(value) - markerWidth / 2)
                .attr('y', axisPadding - markerHeight / 2)
                .attr('transform', 'translate(' + x + ',' + y + ')')
        }

        function updateDisplays(encoding, value) {
            updateOutputBits(encoding)
            updateValue(value, minValue, maxValue, width - axisPadding * 2)
        }

        function encodeValue(v, n, w) {
            return SdrUtils.getRandom(n, w)
        }

        function encode(value) {
            let encoding = encodeValue(value, bits)
            updateDisplays(encoding, value)
        }

        function setUpValueAxis(min, max, maxWidth) {
            let width = maxWidth - axisPadding * 2
            let x = axisPadding, y = axisPadding
            let axisScale = d3.scaleLinear()
                .domain([min, max])
                .range([0, width])
            let xAxis = d3.axisBottom(axisScale)
            $svg.append('g')
                .attr('transform', 'translate(' + x + ',' + y + ')')
                .call(xAxis)
        }

        setUpValueAxis(minValue, maxValue, width)

        setInterval(function() {
            let value = utils.getRandomInt(maxValue)
            encode(value)
        }, 1000)
    })

}
