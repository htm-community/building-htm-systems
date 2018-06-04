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
            color: '#DF0024',
        }, {
            // day of month
            buckets: 31,
            range: 9,
            bits: 21,
            color: '#00AC9F',
        }, {
            // weekend
            buckets: 2,
            range: 11,
            bits: 21,
            color: '#F3C300',
        }, {
            // time of day
            buckets: 23,
            range: 9,
            bits: 21,
            color: '#2E6DB4',
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
