let utils = require('../../../lib/utils')
let html = require('./continuousOverlap.tmpl.html')
let BoundedScalarEncoder = require('BoundedScalarEncoder')

module.exports = (elementId, val1, val2, encoderCfg) => {

    utils.loadHtml(html.default, elementId, () => {

        let encoder = new BoundedScalarEncoder(encoderCfg)

        let width = 560,
            height = 140,
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

        let lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .curve(d3.curveCatmullRom.alpha(0.5));

        function drawBracket(value, i) {
            let valueScaleTopMargin = 30

            let $bracketGroup = $svg.select('.val' + i),
                $leftPath = $bracketGroup.select('path.left'),
                $rightPath = $bracketGroup.select('path.right'),
                $label = $bracketGroup.select('text')



            let leftLineData = []
            let rightLineData = []
            let index = Math.floor(encoder.scale(value))
            let w = encoder.w
            let leftIndex = encoder.reverseScale(index - (w/2)),
                leftValue = encoder.scale(leftIndex),
                rightIndex = encoder.reverseScale(index + (w/2)),
                rightValue = encoder.scale(rightIndex)

            let cx = gutter + index * rectWidth // center x
            let cy = rectHeight * 2.2 // center y

            $label.attr('x', cx)
                .attr('y', cy + 15)
                .html(value)

            leftLineData.push({x: cx, y: cy})
            rightLineData.push({x: cx, y: cy})
            let nearX = xScale(leftValue)
            let farX = xScale(rightValue)
            // Intermediary points for curving
            leftLineData.push({
                x: cx - 10,
                y: cy - 10,
            })
            leftLineData.push({
                x: nearX,
                y: valueScaleTopMargin + 10
            })
            rightLineData.push({
                x: cx + 10,
                y: cy - 10,
            })
            rightLineData.push({
                x: farX,
                y: valueScaleTopMargin + 10
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
            $leftPath
                .attr('d', lineFunction(leftLineData))
                .attr('stroke', 'black')
                .attr('fill', 'none')
            $rightPath
                .attr('d', lineFunction(rightLineData))
                .attr('stroke', 'black')
                .attr('fill', 'none')
            $bracketGroup.attr('visibility', 'visible')

        }

        function drawBrackets() {
            drawBracket(val1, 1)
            drawBracket(val2, 2)
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

        drawBrackets()

    })

}
