let utils = require('../../../lib/utils')
let html = require('./cyclicEncoder.tmpl.html')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId),
            $el = $('#' + elementId)

        let width = 560,
            height = 60,
            minValue = 0,
            maxValue = 100

        let params = {
            resolution: 1,
            w: 9,
            n: 20,
            size: 560,
            color: '#444',
            state: 'line',
        }

        let encoderDisplay = new CyclicEncoderDisplay('lone', params)
        encoderDisplay.render()
        encoderDisplay.loop()

        let jsds = encoderDisplay.jsds

        let $valueSvg = $d3El.select('#value-line')
            .attr('width', width)
            .attr('height', height)

        let $inputRangeSlider = $el.find('#inputRangeSlider')
        let $inputRangeDisplay = $el.find('.inputRangeDisplay')
        let $nSlider = $el.find('#nSlider')
        let $nDisplay = $el.find('.nDisplay')
        let $wSlider = $el.find('#wSlider')
        let $wDisplay = $el.find('.wDisplay')
        let $discreteButton = $el.find('button.discrete')
        let $continuousButton = $el.find('button.continuous')
        let $switchButton = $el.find('button.switch')

        let valueScaleTopMargin = 40,
            valueScaleSideMargins = 10

        function setUpValueAxis($svg, min, max, maxWidth) {
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
            $svg.on('mouseenter', () => {
                encoderDisplay.stop()
            })
            $svg.on('mouseleave', () => {
                encoderDisplay.loop()
            })
            $svg.on('mousemove', () => {
                let mouse = d3.mouse($svg.node())
                if (mouse[1] > 80) return
                let mouseX = mouse[0] - valueScaleSideMargins
                mouseX = Math.min(maxWidth - (valueScaleSideMargins * 2), mouseX)
                mouseX = Math.max(0, mouseX)
                value = utils.precisionRound(xToValue(mouseX), 1)
                jsds.set('value', value)
            })
        }

        function update() {
            let values = parseInt($inputRangeSlider.val())
            let buckets = parseInt($nSlider.val())
            let range = parseInt($wSlider.val())
            encoderDisplay.jsds.set('values', values)
            encoderDisplay.jsds.set('buckets', buckets)
            encoderDisplay.jsds.set('range', range)
            $inputRangeDisplay.html(values)
            $nDisplay.html(buckets)
            $wDisplay.html(range)
        }

        function slideParams(params) {
            let keys = Object.keys(params)
            keys.forEach(function(key) {
                encoderDisplay.jsds.set(key, params[key])
            })
            $inputRangeSlider.val(params.values)
            $inputRangeDisplay.html(params.values)
            $nSlider.val(params.buckets)
            $nDisplay.html(params.buckets)
            $wSlider.val(params.range)
            $wDisplay.html(params.range)
        }


        // Input slider handling
        $inputRangeSlider.on('input', update)
        $nSlider.on('input', update)
        $wSlider.on('input', update)

        // Input Button handling
        $discreteButton.on('click', () => {
            slideParams({
                value: 0,
                values: 7,
                buckets: 21,
                range: 3,
            })
        })
        $continuousButton.on('click', () => {
            slideParams({
                value: 0,
                values: 68,
                buckets: 23,
                range: 7,
            })
        })
        $switchButton.on('click', () => {
            let from = encoderDisplay.state
            let to = 'line'
            if (from === 'line') {
                to = 'circle'
            }
            encoderDisplay.transition(from, to)
        })

        setUpValueAxis($valueSvg, minValue, maxValue, width)
        update()


    })

}
