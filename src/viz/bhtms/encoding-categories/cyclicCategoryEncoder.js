let utils = require('../../../lib/utils')
let html = require('./cyclicCategoryEncoder.tmpl.html')
let CyclicCategoryEncoderDisplay = require('CyclicCategoryEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let params = {
            buckets: 7,
            range: 9,
            bits: 21,
            size: 300,
            color: '#333',
        }

        let encoderDisplay = new CyclicCategoryEncoderDisplay('lone', params)
        encoderDisplay.render()
        encoderDisplay.jsds.set('value', 0)
        encoderDisplay.loop()

        let $el = $('#' + elementId)
        let $bucketsSlider = $el.find('#bucketsSlider')
        let $bucketsDisplay = $el.find('.bucketsDisplay')
        let $bitsSlider = $el.find('#bitsSlider')
        let $bitsDisplay = $el.find('.bitsDisplay')
        let $rangeSlider = $el.find('#rangeSlider')
        let $rangeDisplay = $el.find('.rangeDisplay')
        let $discreteButton = $el.find('button.discrete')
        let $continuousButton = $el.find('button.continuous')

        function update() {
            let buckets = parseInt($bucketsSlider.val())
            let bits = parseInt($bitsSlider.val())
            let range = parseInt($rangeSlider.val())
            encoderDisplay.jsds.set('buckets', buckets)
            encoderDisplay.jsds.set('bits', bits)
            encoderDisplay.jsds.set('range', range)
            $bucketsDisplay.html(buckets)
            $bitsDisplay.html(bits)
            $rangeDisplay.html(range)
        }

        function slideParams(params) {
            let keys = Object.keys(params)
            keys.forEach(function(key) {
                encoderDisplay.jsds.set(key, params[key])
            })
            $bucketsSlider.val(params.buckets)
            $bucketsDisplay.html(params.buckets)
            $bitsSlider.val(params.bits)
            $bitsDisplay.html(params.bits)
            $rangeSlider.val(params.range)
            $rangeDisplay.html(params.range)
        }

        update()

        $bucketsSlider.on('input', update)
        $bitsSlider.on('input', update)
        $rangeSlider.on('input', update)

        $discreteButton.on('click', () => {
            slideParams({
                value: 0,
                buckets: 7,
                bits: 21,
                range: 3,
            })
        })

        $continuousButton.on('click', () => {
            slideParams({
                value: 0,
                buckets: 29,
                bits: 47,
                range: 18,
            })
        })


    })

}
