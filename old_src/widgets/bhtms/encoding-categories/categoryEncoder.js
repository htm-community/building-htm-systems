let utils = require('../../../lib/utils')
let html = require('./categoryEncoder.tmpl.html')
let CategoryEncoderDisplay = require('CategoryEncoderDisplay')

module.exports = (elementId, opts) => {

    utils.loadHtml(html.default, elementId, () => {
        let $svg = d3.select('#' + elementId + ' svg')
        let categories = opts.categories

        let encoderDisplay = new CategoryEncoderDisplay($svg, {
            size: 500,
            color: 'skyblue',
            w: opts.w,
            categories: categories,
        })

        encoderDisplay.jsds.after('set', 'encoding', () => {
            encoderDisplay.updateDisplay()
        })
        encoderDisplay.jsds.after('set', 'value', (value) => {
            let encoding = encoderDisplay.encoder.encode(value)
            encoderDisplay.jsds.set('encoding', encoding)
        })

        let currentIndex = 0
        setInterval(() => {
            encoderDisplay.jsds.set('value', categories[currentIndex])
            let cats = encoderDisplay.encoder.categories.length
            if (currentIndex++ >= cats-1 ) {
                currentIndex = 0
            }
        }, 600)

        // Start
        encoderDisplay.render()
        encoderDisplay.jsds.set('value', categories[currentIndex++])

    })

}
