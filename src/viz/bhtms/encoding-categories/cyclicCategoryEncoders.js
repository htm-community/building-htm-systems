let utils = require('../../../lib/utils')
let html = require('./cyclicCategoryEncoders.tmpl.html')
let CyclicCategoryEncoderDisplay = require('CyclicCategoryEncoderDisplay')
let CyclicCategoryEncoder = require('CyclicCategoryEncoder')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId),
            $svgs = $d3El.selectAll('svg')

        let size = 135

        let min = 0,
            max = 6,
            bits = 12,
            range = 3

        let displays = $svgs.nodes().map((svg, i) => {
            let $svg = d3.select(svg)

            let encoder = new CyclicCategoryEncoder(min, max, range, bits)
            let encoderDisplay = new CyclicCategoryEncoderDisplay(i, $svg, encoder, {
                size: size,
                min: min,
                max: max,
                bits: bits,
                range: range,
            })
            encoderDisplay.render()
            return encoderDisplay
        })

        setInterval(() => {
            displays.forEach(cced => {
                let value = Math.round(utils.getRandomArbitrary(cced.min, cced.max))
                cced.jsds.set('value', value)
            })
        }, 300)

    })

}
