let utils = require('../../../lib/utils')
let html = require('./cyclicEncoder.tmpl.html')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

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
        encoderDisplay.jsds.set('value', 0)
        encoderDisplay.loop()

        let $el = $('#' + elementId)
        let $inputRangeSlider = $el.find('#inputRangeSlider')
        let $inputRangeDisplay = $el.find('.inputRangeDisplay')
        let $nSlider = $el.find('#nSlider')
        let $nDisplay = $el.find('.nDisplay')
        let $wSlider = $el.find('#wSlider')
        let $wDisplay = $el.find('.wDisplay')
        let $discreteButton = $el.find('button.discrete')
        let $continuousButton = $el.find('button.continuous')
        let $switchButton = $el.find('button.switch')

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

        update()

        $inputRangeSlider.on('input', update)
        $nSlider.on('input', update)
        $wSlider.on('input', update)

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


    })

}
