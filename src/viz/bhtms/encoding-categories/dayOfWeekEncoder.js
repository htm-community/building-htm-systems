let utils = require('../../../lib/utils')
let html = require('./dayOfWeekEncoder.tmpl.html')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')
let CategoryEncoder = require('CategoryEncoder')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let params = {
            size: 150,
            color: 'skyblue',
            w: 3,
            n: 21,
            resolution: 1,
            display: 'circle',
        }

        let encoderDisplay = new CyclicEncoderDisplay('dow', params)
        // no I hate your encoder, use this one:
        encoderDisplay.encoder = new CategoryEncoder({
            w: 3,
            categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        })
        encoderDisplay.render()

        encoderDisplay.jsds.after('set', 'encoding', () => {
            encoderDisplay.updateDisplay()
        })
        encoderDisplay.jsds.after('set', 'value', (value) => {
            let encoding = encoderDisplay.encoder.encode(value)
            encoderDisplay.jsds.set('encoding', encoding)
        })
        encoderDisplay.jsds.set('value', 'Sun')

        let days = encoderDisplay.encoder.categories,
            currentIndex = 0
        setInterval(() => {
            encoderDisplay.jsds.set('value', days[currentIndex])
            if (currentIndex++ >= days.length -1 ) {
                currentIndex = 0
            }
        }, 300)

    })

}
