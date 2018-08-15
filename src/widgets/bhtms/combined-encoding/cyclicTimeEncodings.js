let ScalarEncoder = require('ScalarEncoder')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')
let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./cyclicTimeEncodings.tmpl.html')

let timeEncoderNames = [
    'day-of-month',
    'weekend',
    'day-of-week',
    'time-of-day',
]
let timeEncoderParams = [{
    // day of month
    values: 31,
    range: 9,
    buckets: 31,
    onColor: '#DF0024',
    n: 31,
    w: 5,
}, {
    // weekend
    values: 2,
    range: 11,
    buckets: 21,
    onColor: '#00AC9F',
    n: 50,
    w: 15,
}, {
    // day of week
    values: 7,
    range: 9,
    buckets: 21,
    onColor: '#F3C300',
    n: 70,
    w: 9,
}, {
    // time of day
    values: 24,
    range: 9,
    buckets: 21,
    onColor: '#2E6DB4',
    n: 100,
    w: 21,
}]

let encoder
let scalarBits = 100
let range = 0.5
let min = -1.25
let max = 1.25

let timeEncoders = {}

module.exports = (elementId, dataProviderId) => {

    utils.loadHtml(html.default, elementId, () => {

        let width = 560
        let size = width / 2
        let provider = JSDS.get(dataProviderId + '-' + dataProviderId)

        function renderTimeCycles() {
            timeEncoderNames.forEach((name, i) => {
                let prms = timeEncoderParams[i]

                // Each one has same stuff below
                prms.center = {x: size/2, y: size/2}
                prms.size = size
                prms.radius = size/2 * .7
                prms.offColor = '#303240'
                prms.pointSize = 10
                prms.min = 0
                prms.max = prms.buckets

                let encoderDisplay = new CyclicEncoderDisplay(elementId + '-' + name, prms)
                encoderDisplay.render()
                timeEncoders[name] = encoderDisplay
                encoderDisplay.jsds.set('value', 0)
            })
        }

        function updateTimeEncoders() {
            let value = provider.get('value');
            let time = value.time

            let dayOfMonth = time.getDate() - 1
            let dayOfWeek = time.getDay()
            let isWeekend = 0
            let hourOfDay = time.getHours()
            if ((dayOfWeek === 6) || (dayOfWeek === 0)) {
                isWeekend = 1
            }

            timeEncoders['day-of-month'].jsds.set('value', dayOfMonth)
            timeEncoders['weekend'].jsds.set('value', isWeekend)
            timeEncoders['day-of-week'].jsds.set('value', dayOfWeek)
            timeEncoders['time-of-day'].jsds.set('value', hourOfDay)
        }

        encoder = new ScalarEncoder({
            w: range, n: scalarBits, min: min, max: max, bounded: true
        })

        renderTimeCycles()

        provider.after('set', 'value', updateTimeEncoders)


    })

}
