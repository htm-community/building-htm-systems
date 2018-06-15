let utils = require('../../../lib/utils')
let html = require('./discreteEncoding.tmpl.html')
let dat = require('dat.gui')
let JSDS = require('JSDS')
let CategoryEncoder = require('CategoryEncoder')

module.exports = (elementId, initialValue, encoderCfg) => {

    utils.loadHtml(html.default, elementId, () => {

        let cfg = Object.assign({}, encoderCfg)
        cfg.categories = d3.range(0, encoderCfg.categories-1)
        let encoder = new CategoryEncoder(cfg)

        let jsds = JSDS.create('discreteEncoding-' + elementId)

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
            value: initialValue,
            w: encoderCfg.w,
            n: encoderCfg.n,
            categories: encoderCfg.categories,
        }
        // Stash for later mutation outside UI.
        Object.keys(uiValues).forEach(k => {
            jsds.set(k, uiValues[k])
        })

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
                    let item = gui.add.apply(gui, args).listen().onChange(value => {
                        jsds.set(propName, value)
                    })
                    if (step) {
                        item.step(step)
                    }
                } else {
                    uiValues[propName] = value
                }
                // When someone sets a property through JSDS, the UI needs to update.
                jsds.after('set', propName, (value) => {
                    uiValues[propName] = value
                    onChange()
                })
            })

            $el.html(gui.domElement)
        }

        function drawBracket(value) {
            let valueScaleTopMargin = 30

            let $bracketGroup = $svg.select('g.range'),
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
                .html(utils.precisionRound(value, 1))

            leftLineData.push({x: cx, y: cy})
            rightLineData.push({x: cx, y: cy})
            let nearX = Math.max(outputRangeScale(leftValue), uiRange[0]),
                farX = Math.min(outputRangeScale(rightValue), uiRange[1])
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
            drawBracket(uiValues.value)
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
                    if (d === 1) return 'skyblue'
                    return 'white'
                })
        }

        function createEncoder() {
            let cfg = Object.assign({}, encoderCfg, uiValues)
            cfg.categories = d3.range(0, cfg.categories-1)
            encoder = new CategoryEncoder(cfg)
            rectWidth = (uiRange[1] - uiRange[0]) / encoder.n
            outputRangeScale = d3.scaleLinear()
                .domain(encoder.outputRange)
                .range(uiRange)
        }

        function render() {
            createEncoder()
            Object.keys(uiValues).forEach(k => {
                uiValues[k] = jsds.get(k)
            })
            let data = encoder.encode(uiValues.value)

            let rects = $svg.selectAll('rect').data(data)
            treatRects(rects)

            let newRects = rects.enter().append('rect')
            treatRects(newRects)

            rects.exit().remove()

            drawBrackets()
        }

        let guiCfg = {
            value: [encoder.min, initialValue, encoder.max - 1, 1],
            w: [3, encoderCfg.w, 10, 1],
            categories: [3, uiValues.categories, 16, 1],
        }
        setupDatGui($datGui, guiCfg, render)

        render()

    })

}
