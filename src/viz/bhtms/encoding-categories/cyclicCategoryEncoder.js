let utils = require('../../../lib/utils')
let html = require('./cyclicCategoryEncoder.tmpl.html')
let CyclicCategoryEncoderDisplay = require('CyclicCategoryEncoderDisplay')
let CyclicCategoryEncoder = require('CyclicCategoryEncoder')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let params = {
            buckets: 7,
            range: 9,
            bits: 21,
            size: 300,
            color: 'black',
        }

        let encoder = new CyclicCategoryEncoder(params)
        let encoderDisplay = new CyclicCategoryEncoderDisplay('lone', encoder, params)
        encoderDisplay.render()
        encoderDisplay.jsds.set('value', 0)
        encoderDisplay.loop()

    })

}
