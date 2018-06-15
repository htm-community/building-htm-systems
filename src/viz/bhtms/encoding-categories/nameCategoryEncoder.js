let utils = require('../../../lib/utils')
let html = require('./nameCategoryEncoder.tmpl.html')
let CategoryEncoderDisplay = require('CategoryEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let names = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava']

        let params = {
            size: 150,
            color: 'skyblue',
            w: 10,
            categories: names,
        }

        let encoderDisplay = new CategoryEncoderDisplay('dow', params)
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
