let utils = require('../../../lib/utils')
let html = require('./dayOfWeekEncoder.tmpl.html')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let params = {
            buckets: 21,
            range: 3,
            bits: 21,
            size: 300,
            color: '#333',
        }

        let encoderDisplay = new CyclicEncoderDisplay('dow', params)
        encoderDisplay.render()
        encoderDisplay.jsds.set('value', 0)
        encoderDisplay.loop()

        function update() {
            encoderDisplay.jsds.set('buckets', params.buckets)
            encoderDisplay.jsds.set('bits', params.bits)
            encoderDisplay.jsds.set('range', params.range)
        }

        update()

    })

}
