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
        let $valuesSlider = $el.find('#valuesSlider')
        let $valuesDisplay = $el.find('.valuesDisplay')
        let $bucketsSlider = $el.find('#bucketsSlider')
        let $bucketsDisplay = $el.find('.bucketsDisplay')
        let $rangeSlider = $el.find('#rangeSlider')
        let $rangeDisplay = $el.find('.rangeDisplay')
        let $discreteButton = $el.find('button.discrete')
        let $continuousButton = $el.find('button.continuous')
        let $switchButton = $el.find('button.switch')

        function update() {
            let values = parseInt($valuesSlider.val())
            let buckets = parseInt($bucketsSlider.val())
            let range = parseInt($rangeSlider.val())
            encoderDisplay.jsds.set('values', values)
            encoderDisplay.jsds.set('buckets', buckets)
            encoderDisplay.jsds.set('range', range)
            $valuesDisplay.html(values)
            $bucketsDisplay.html(buckets)
            $rangeDisplay.html(range)
        }

        function slideParams(params) {
            let keys = Object.keys(params)
            keys.forEach(function(key) {
                encoderDisplay.jsds.set(key, params[key])
            })
            $valuesSlider.val(params.values)
            $valuesDisplay.html(params.values)
            $bucketsSlider.val(params.buckets)
            $bucketsDisplay.html(params.buckets)
            $rangeSlider.val(params.range)
            $rangeDisplay.html(params.range)
        }

        update()

        $valuesSlider.on('input', update)
        $bucketsSlider.on('input', update)
        $rangeSlider.on('input', update)

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
