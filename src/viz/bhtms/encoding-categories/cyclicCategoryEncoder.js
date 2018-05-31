let utils = require('../../../lib/utils')
let html = require('./cyclicCategoryEncoder.tmpl.html')
let CyclicCategoryEncoderDisplay = require('CyclicCategoryEncoderDisplay')
let CyclicCategoryEncoder = require('CyclicCategoryEncoder')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId),
            $svg = $d3El.select('svg')

        let size = 300

        let min = 0,
            max = 6,
            bits = 12,
            range = 3

        let encoder = new CyclicCategoryEncoder(min, max, range, bits)

        let encoderDisplay = new CyclicCategoryEncoderDisplay('1', $svg, encoder, {
            size: size,
            min: min,
            max: max,
            bits: bits,
            range: range,
        })
        encoderDisplay.render()

        let counter = min

        setInterval(() => {
            encoderDisplay.jsds.set('value', counter++)
            if (counter >= max) counter = 0
        }, 300)

    })

}
