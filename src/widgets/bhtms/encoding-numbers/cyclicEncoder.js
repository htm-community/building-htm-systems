let utils = require('../../../lib/utils')
let html = require('./cyclicEncoder.tmpl.html')
let dat = require('dat.gui')
let FancyCyclicEncoderDisplay = require('FancyCyclicEncoderDisplay')

module.exports = (elementId, config) => {

    const onColor = 'skyblue'
    let uiValues = {}

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

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId),
            $jqEl = $('#' + elementId),
            $datGui = $jqEl.find('.dat-gui'),
            $lineSvg = $d3El.select('.value-line'),
            $bitsSvg = $d3El.select('.bits')

        let width = 560,
            valueLineHeight = 80

        let valueScaleTopMargin = 40,
            valueScaleSideMargins = 10

        $lineSvg
            .attr('width', width)
            .attr('height', valueLineHeight)

        $bitsSvg
            .attr('width', width)

        let valueToX
        let xToValue

        let encoderDisplay

        function setUpValueAxis(min, max, maxWidth) {
            // console.log('Setting up value axis from %s to %s', min, max)
            let width = maxWidth - valueScaleSideMargins * 2
            let x = valueScaleSideMargins, y = valueScaleTopMargin
            valueToX = d3.scaleLinear()
                .domain([min, max])
                .range([0, width])
            xToValue = d3.scaleLinear()
                .domain([0, width])
                .range([min, max])
            let xAxis = d3.axisBottom(valueToX)
            let treatAxis = (axis) => {
                axis.attr('class', 'axis')
                    .attr('transform', 'translate(' + x + ',' + y + ')')
                    .call(xAxis)
            }
            let $axis = $lineSvg.selectAll('g.axis').data([null])
            treatAxis($axis)
            let $newAxis = $axis.enter().append('g')
            treatAxis($newAxis)
            $axis.exit().remove()
            $lineSvg.on('mousemove', () => {
                let mouse = d3.mouse($lineSvg.node())
                if (mouse[1] > 80) return
                let mouseX = mouse[0] - valueScaleSideMargins
                mouseX = Math.min(maxWidth - (valueScaleSideMargins * 2), mouseX)
                mouseX = Math.max(0, mouseX)
                value = utils.precisionRound(xToValue(mouseX), 1)
                encoderDisplay.jsds.set('value', value)
            })
        }

        function updateOutputBits() {
            encoderDisplay.updateDisplay()
        }

        function updateValue(value) {
            let xOffset = valueScaleSideMargins,
                yOffset = valueScaleTopMargin,
                markerWidth = 1,
                markerHeight = 40

            let x = valueToX(value) - (markerWidth / 2)
            let y = 0 - (markerHeight / 2) - 6

            $lineSvg.select('g.value text')
                .attr('x', x - 6)
                .attr('y', y)
                .attr('font-family', 'sans-serif')
                .attr('font-size', '10pt')
                .text(value)
            let spacing = 7
            $lineSvg.select('g.value rect')
                .attr('stroke', 'red')
                .attr('stroke-width', 1.5)
                .attr('fill', 'none')
                .attr('width', markerWidth)
                .attr('height', markerHeight)
                .attr('x', x)
                .attr('y', y + spacing)

            $lineSvg.select('g.value')
                .attr('transform', 'translate(' + xOffset + ',' + yOffset + ')')
        }

        function updateDisplays(encoding, value) {
            updateOutputBits()
            if (value) updateValue(value)
        }

        function createEncoder(opts) {
            let params = Object.assign({
                size: width,
                color: onColor,
                w: uiValues.w,
                n: uiValues.n,
                resolution: uiValues.resolution,
                display: uiValues.display,
            }, opts)
            encoderDisplay = new FancyCyclicEncoderDisplay($bitsSvg, params)
        }

        function render() {
            let value = encoderDisplay.jsds.get('value')
            let encoding = encoderDisplay.encoder.encode(value)
            setUpValueAxis(encoderDisplay.encoder.min, encoderDisplay.encoder.max, width)
            updateDisplays(encoding, value)
        }

        // Start Program
        setupDatGui($datGui, config, () => {
            let previousState = encoderDisplay.display
            let newState = uiValues.display
            createEncoder({state: previousState})
            if (newState !== previousState) {
                encoderDisplay.transition(previousState, newState)
            }
            let encoding = encoderDisplay.encoder.encode(
                encoderDisplay.jsds.get('value')
            )
            encoderDisplay.render()
            render()
            encoderDisplay.jsds.set('encoding', encoding)
        })

        createEncoder()
        encoderDisplay.render()
        render()

        // When a new value is set, update value bar
        encoderDisplay.jsds.after('set', 'value', (value) => {
            updateValue(value)
            let encoding = encoderDisplay.encoder.encode(value)
            encoderDisplay.jsds.set('encoding', encoding)
        })
        // When an encoding is set, update bits
        encoderDisplay.jsds.after('set', 'encoding', (encoding) => {
            updateOutputBits()
        })

        encoderDisplay.jsds.set(
            'value',
            (encoderDisplay.encoder.max - encoderDisplay.encoder.min) / 2
        )


    })

}
