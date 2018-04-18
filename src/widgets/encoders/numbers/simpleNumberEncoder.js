let RelativeScalarEncoder =require('../../../htm/encoders/relativeScalarEncoder')
let ScalarEncoder = require('../../../htm/encoders/scalar').ScalarEncoder
let utils = require('../../utils')
let html = require('./simpleNumberEncoder.tmpl.html')

const onColor = 'skyblue'
const offColor = 'white'

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let width = 560,
            height = 200,
            minValue = 0,
            maxValue = 55,
            bits = 100,
            value = 30

        let valueScaleTopMargin = 40,
            valueScaleSideMargins = 10

        let $rangeSlider = $('#rangeSlider'),
            $valueDisplays = $('.valueDisplay'),
            $rangeDisplays = $('.rangeDisplay')

        let range = parseInt(parseInt($rangeSlider.val()) / 100)

        let $svg = d3.select('#' + elementId).select('svg')
            .attr('width', width)
            .attr('height', height)

        let valueToX
        let xToValue

        let encoder

        function updateOutputBits(encoding, maxWidth) {
            let topMargin = 120
            let padding = 30
            let bits = encoding.length
            let width = maxWidth - (padding * 2)
            let bitsToOutputDisplay = d3.scaleLinear()
                .domain([0, bits])
                .range([0, width])
            let cellWidth = Math.floor(width / bits)
            let $outputGroup = $svg.select('g.encoding')
            let $hoverGroup = $svg.select('g.range')

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
                    .attr('y', padding)
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

            $outputGroup
                .attr('transform', 'translate(' + padding + ',' + topMargin + ')')

            rects = $outputGroup.selectAll('rect.bit')

            let lineFunction = d3.line()
                                 .x(function(d) { return d.x; })
                                 .y(function(d) { return d.y; })
                                 .curve(d3.curveCatmullRom.alpha(0.5));
            rects.on('mouseenter', (bit, index) => {
                let cx = padding + bitsToOutputDisplay(index) + (cellWidth / 2)
                let cy = topMargin + 30
                let valueRange = encoder.getRangeFromBitIndex(index)
                // Circle point
                $hoverGroup.select('g.range circle')
                    .attr('r', cellWidth / 2)
                    .attr('cx', cx)
                    .attr('cy', cy)
                    .attr('fill', 'royalblue')
                let leftValueBound = Math.max(minValue, valueRange[0]),
                    rightValueBound = Math.min(maxValue, valueRange[1])
                let leftLineData = []
                let rightLineData = []
                leftLineData.push({x: cx, y: cy})
                rightLineData.push({x: cx, y: cy})
                let nearX = valueScaleSideMargins + valueToX(leftValueBound)
                let farX = valueScaleSideMargins + valueToX(rightValueBound)
                // Intermediary points for curving
                leftLineData.push({
                    x: cx - 10,
                    y: cy - 20,
                })
                leftLineData.push({
                    x: nearX,
                    y: valueScaleTopMargin + 20
                })
                rightLineData.push({
                    x: cx + 10,
                    y: cy - 20,
                })
                rightLineData.push({
                    x: farX,
                    y: valueScaleTopMargin + 20
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
                $hoverGroup.select('path.left')
                    .attr('d', lineFunction(leftLineData))
                    .attr('stroke', 'black')
                    .attr('fill', 'none')
                $hoverGroup.select('path.right')
                    .attr('d', lineFunction(rightLineData))
                    .attr('stroke', 'black')
                    .attr('fill', 'none')
                $hoverGroup.attr('visibility', 'visible')
            })
            $outputGroup.on('mouseout', () => {
                $hoverGroup.attr('visibility', 'hidden')
            })
        }

        function updateValue(value) {
            let xOffset = valueScaleSideMargins,
                yOffset = valueScaleTopMargin,
                markerWidth = 1,
                markerHeight = 30

            let x = valueToX(value) - (markerWidth / 2)
            let y = - (markerHeight / 2)

            $svg.select('g.value text')
                .attr('x', x)
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

        function updateDisplays(encoding, value) {
            updateOutputBits(encoding, width)
            updateValue(value)
        }

        function encode(value) {
            encoder.w = range
            let encoding = encoder.encode(value)
            updateDisplays(encoding, value)
        }

        function setUpValueAxis(min, max, maxWidth) {
            let width = maxWidth - valueScaleSideMargins * 2
            let x = valueScaleSideMargins, y = valueScaleTopMargin
            valueToX = d3.scaleLinear()
                .domain([min, max])
                .range([0, width])
            xToValue = d3.scaleLinear()
                .domain([0, width])
                .range([min, max])
            let xAxis = d3.axisBottom(valueToX)
            $svg.append('g')
                .attr('transform', 'translate(' + x + ',' + y + ')')
                .call(xAxis)
            $svg.on('mousemove', () => {
                let mouse = d3.mouse($svg.node())
                if (mouse[1] > 80) return
                let mouseX = mouse[0] - valueScaleSideMargins
                mouseX = Math.min(maxWidth - (valueScaleSideMargins * 2), mouseX)
                mouseX = Math.max(0, mouseX)
                value = utils.precisionRound(xToValue(mouseX), 1)
                runEncode()
            })
        }

        setUpValueAxis(minValue, maxValue, width)


        function runEncode() {
            range = parseInt(parseInt($rangeSlider.val()) / 100)
            encode(value)
            $valueDisplays.html(value)
            $rangeDisplays.html(range)
        }

        $rangeSlider.on('input', () => {
            range = parseInt(parseInt($rangeSlider.val()) / 100);
            encoder = new RelativeScalarEncoder(bits, range, minValue, maxValue)
            runEncode()
        })

        encoder = new RelativeScalarEncoder(bits, range, minValue, maxValue)
        runEncode()

    })

}
