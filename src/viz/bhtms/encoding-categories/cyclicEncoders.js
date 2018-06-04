let utils = require('../../../lib/utils')
let html = require('./cyclicEncoders.tmpl.html')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {
        let size = 135

        let params = [{
            // day of week
            buckets: 7,
            range: 9,
            bits: 21,
            color: 'red',
        }, {
            // day of month
            buckets: 31,
            range: 9,
            bits: 21,
            color: 'green',
        }, {
            // weekend
            buckets: 2,
            range: 11,
            bits: 21,
            color: 'yellow',
        }, {
            // time of day
            buckets: 23,
            range: 9,
            bits: 21,
            color: 'blue',
        }]

        let names = [
            'season',
            'day-of-month',
            'weekend',
            'time-of-day'
        ]

        let displays = names.map((name, i) => {
            let prms = params[i]
            prms.size = size
            let encoderDisplay = new CyclicEncoderDisplay(name, prms)
            encoderDisplay.render()
            return encoderDisplay
        })

        displays.forEach((d, i) => {
            d.jsds.set('value', 0)
            d.loop()
        })

    })

}
