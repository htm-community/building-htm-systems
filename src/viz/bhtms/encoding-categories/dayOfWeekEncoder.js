let utils = require('../../../lib/utils')
let html = require('./dayOfWeekEncoder.tmpl.html')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {

        let params = {
            values: 7,
            range: 3,
            buckets: 21,
            size: 300,
            color: '#333',
        }

        let encoderDisplay = new CyclicEncoderDisplay('dow', params)
        encoderDisplay.render()
        encoderDisplay.jsds.set('value', 0)
        encoderDisplay.loop()

        function update() {
            encoderDisplay.jsds.set('values', params.values)
            encoderDisplay.jsds.set('buckets', params.buckets)
            encoderDisplay.jsds.set('range', params.range)
        }

        update()

    })

}
