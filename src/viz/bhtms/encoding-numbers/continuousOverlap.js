let utils = require('../../../lib/utils')
let html = require('./continuousOverlap.tmpl.html')
let BoundedScalarEncoder = require('BoundedScalarEncoder')

module.exports = (elementId, val1, val2, encoderCfg) => {

    utils.loadHtml(html.default, elementId, () => {

        let encoder = new BoundedScalarEncoder(encoderCfg)

        let width = 560,
            height = 100,
            gutter = 20,
            uiRange = [gutter, width - gutter],
            rectWidth = (uiRange[1] - uiRange[0]) / encoder.n,
            rectHeight = 30

        let $svg = d3.select('#' + elementId + ' svg')
            .attr('width', width)
            .attr('height', height)

        let xScale = d3.scaleLinear()
            .domain(encoder.outputRange)
            .range(uiRange)

        let encoding1 = encoder.encode(val1),
            encoding2 = encoder.encode(val2)

        let data = encoding1.map((e, i) => {
            return [e, encoding2[i]]
        })

        function drawBrackets(barPoint1, barPoint2, labelCenter) {
            
        }

        function treatRects(rects) {
            rects
                .attr('x', (d, i) => {
                    return xScale(i)
                })
                .attr('y', 0)
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .attr('stroke', 'grey')
                .attr('fill', (d) => {
                    let color = 'white',
                        left = d[0],
                        right = d[1]
                    if (left === 1) {
                        if (right === 1) color = 'green'
                        else color = 'blue'
                    } else if (right === 1) {
                        color = 'yellow'
                    }
                    return color
                })
        }

        let rects = $svg.selectAll('rect').data(data)
        treatRects(rects)

        let newRects = rects.enter().append('rect')
        treatRects(newRects)

        rects.exit().remove()

    })

}
