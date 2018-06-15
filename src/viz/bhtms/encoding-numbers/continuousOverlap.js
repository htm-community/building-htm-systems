let utils = require('../../../lib/utils')
let html = require('./continuousOverlap.tmpl.html')
let dat = require('dat.gui')
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

        let uiValues = {
            blue: 4,
            yellow: 5,
        }

        let $datGui = $('#' + elementId + ' .dat-gui')

        let outputRangeScale = d3.scaleLinear()
            .domain(encoder.outputRange)
            .range(uiRange)

        let lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .curve(d3.curveCatmullRom.alpha(0.5));

        function setupDatGui($el, cfg, onChange) {
            let gui = new dat.GUI({
                autoPlace: false,
            })
            Object.keys(cfg).forEach(propName => {
                let value = cfg[propName]
                let args = [uiValues, propName]
                if (Array.isArray(value)) {
                    let step
                    if (typeof(value[0]) === 'number') {
                        let min = value[0],
                            start = value[1],
                            max = value[2]
                        step = value[3]
                        args.push(min)
                        args.push(max)
                        uiValues[propName] = start
                    } else if (typeof(value[0]) === 'string') {
                        args.push(value)
                        uiValues[propName] = value[0]
                    }
                    let item = gui.add.apply(gui, args).onChange(value => {
                        uiValues[propName] = value
                        onChange()
                    })
                    if (step) {
                        item.step(step)
                    }
                } else {
                    uiValues[propName] = value
                }
            })
            $el.append(gui.domElement)
        }

        function drawBracket(value, i) {
            let valueScaleTopMargin = 30

            let $bracketGroup = $svg.select('.val' + i),
                $bluePath = $bracketGroup.select('path.blue'),
                $yellowPath = $bracketGroup.select('path.yellow'),
                $label = $bracketGroup.select('text')

            let blueLineData = []
            let yellowLineData = []
            let index = Math.floor(encoder.scale(value))
            let w = encoder.w
            let blueIndex = encoder.reverseScale(index - (w/2)),
                blueValue = encoder.scale(blueIndex),
                yellowIndex = encoder.reverseScale(index + (w/2)),
                yellowValue = encoder.scale(yellowIndex)

            let cx = gutter + index * rectWidth // center x
            let cy = rectHeight * 2.2 // center y

            $label.attr('x', cx)
                .attr('y', cy + 15)
                .html(utils.precisionRound(value, 1))

            blueLineData.push({x: cx, y: cy})
            yellowLineData.push({x: cx, y: cy})
            let nearX = Math.max(outputRangeScale(blueValue), uiRange[0]),
                farX = Math.min(outputRangeScale(yellowValue), uiRange[1])
            // Intermediary points for curving
            blueLineData.push({
                x: cx - 10,
                y: cy - 10,
            })
            blueLineData.push({
                x: nearX,
                y: valueScaleTopMargin + 10
            })
            yellowLineData.push({
                x: cx + 10,
                y: cy - 10,
            })
            yellowLineData.push({
                x: farX,
                y: valueScaleTopMargin + 10
            })

            // Point on value line
            blueLineData.push({
                x: nearX,
                y: valueScaleTopMargin
            })
            yellowLineData.push({
                x: farX,
                y: valueScaleTopMargin
            })
            $bluePath
                .attr('d', lineFunction(blueLineData))
                .attr('stroke', 'black')
                .attr('fill', 'none')
            $yellowPath
                .attr('d', lineFunction(yellowLineData))
                .attr('stroke', 'black')
                .attr('fill', 'none')
            $bracketGroup.attr('visibility', 'visible')

        }

        function drawBrackets() {
            drawBracket(uiValues.blue, 1)
            drawBracket(uiValues.yellow, 2)
        }

        function treatRects(rects) {
            rects
                .attr('x', (d, i) => {
                    return outputRangeScale(i)
                })
                .attr('y', 0)
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .attr('stroke', 'grey')
                .attr('fill', (d) => {
                    let color = 'white',
                        blue = d[0],
                        yellow = d[1]
                    if (blue === 1) {
                        if (yellow === 1) color = 'green'
                        else color = 'blue'
                    } else if (yellow === 1) {
                        color = 'yellow'
                    }
                    return color
                })
        }

        function render() {
            let encoding1 = encoder.encode(uiValues.blue),
                encoding2 = encoder.encode(uiValues.yellow)

            let data = encoding1.map((e, i) => {
                return [e, encoding2[i]]
            })

            let rects = $svg.selectAll('rect').data(data)
            treatRects(rects)

            let newRects = rects.enter().append('rect')
            treatRects(newRects)

            rects.exit().remove()

            drawBrackets()
        }

        let guiCfg = {}
        guiCfg.blue = [2, 4, 9]
        guiCfg.yellow = [2, 5, 9]

        setupDatGui($datGui, guiCfg, render)

        render()

    })

}
