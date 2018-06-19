let utils = require('../../../lib/utils')
let html = require('./categoryEncoder.tmpl.html')
let CategoryEncoderDisplay = require('CategoryEncoderDisplay')

module.exports = (elementId, opts) => {

    utils.loadHtml(html.default, elementId, () => {
        let $svg = d3.select('#' + elementId + ' svg')
        let names = opts.categories

        let params = {
            size: 500,
            color: 'skyblue',
            w: opts.w,
            categories: names,
        }

        let encoderDisplay = new CategoryEncoderDisplay($svg, params)
        encoderDisplay.render()

        encoderDisplay.jsds.after('set', 'encoding', () => {
            encoderDisplay.updateDisplay()
        })
        encoderDisplay.jsds.after('set', 'value', (value) => {
            let encoding = encoderDisplay.encoder.encode(value)
            encoderDisplay.jsds.set('encoding', encoding)
        })
        encoderDisplay.jsds.set('value', names[0])

        let currentIndex = 0
        setInterval(() => {
            encoderDisplay.jsds.set('value', names[currentIndex])
            if (currentIndex++ >= names.length -1 ) {
                currentIndex = 0
            }
        }, 600)

    })

}
