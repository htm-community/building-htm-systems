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
            color: 'black',
        }

        let encoderDisplay = new CyclicCategoryEncoderDisplay('lone', params)
        encoderDisplay.render()
        encoderDisplay.jsds.set('value', 0)
        encoderDisplay.loop()

        let $bucketsSlider = $('#bucketsSlider')
        let $bucketsDisplay = $('.bucketsDisplay')
        let $bitsSlider = $('#bitsSlider')
        let $bitsDisplay = $('.bitsDisplay')
        let $rangeSlider = $('#rangeSlider')
        let $rangeDisplay = $('.rangeDisplay')

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

        update()

        $bucketsSlider.on('input', update)
        $bitsSlider.on('input', update)
        $rangeSlider.on('input', update)
    })

}
