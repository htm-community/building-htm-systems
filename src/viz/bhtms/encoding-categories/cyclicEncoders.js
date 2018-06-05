let utils = require('../../../lib/utils')
let html = require('./cyclicEncoders.tmpl.html')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {
        let size = 135

        let params = [{
            // day of week
            values: 7,
            range: 9,
            buckets: 21,
            color: '#DF0024',
        }, {
            // day of month
            values: 31,
            range: 9,
            buckets: 21,
            color: '#00AC9F',
        }, {
            // weekend
            values: 2,
            range: 11,
            buckets: 21,
            color: '#F3C300',
        }, {
            // time of day
            values: 23,
            range: 9,
            buckets: 21,
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
