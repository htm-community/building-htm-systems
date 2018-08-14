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
    buckets: 21,
    onColor: '#DF0024',
    n: 100,
    w: 11,
}, {
    // weekend
    values: 2,
    range: 11,
    buckets: 21,
    onColor: '#00AC9F',
    n: 50,
    w: 5,
}, {
    // day of week
    values: 7,
    range: 3,
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

        let size = 135
        let provider = JSDS.get(dataProviderId + '-' + dataProviderId)

        function renderTimeCycles() {
            timeEncoderNames.forEach((name, i) => {
                let prms = timeEncoderParams[i]
                // Each one has same size and center
                prms.center = {x: size/2, y: size/2}
                prms.size = size
                prms.radius = size * .4
                prms.offColor = '#303240'
                let encoderDisplay = new CyclicEncoderDisplay(elementId + '-' + name, prms)
                encoderDisplay.render()
                timeEncoders[name] = encoderDisplay
                encoderDisplay.jsds.set('value', 0)
            })
        }

        function updateTimeEncoders() {
            let time = provider.get('value').time
            let dayOfWeek = time.getDay()
            let isWeekend = 0
            let hourOfDay = time.getHours()
            if ((dayOfWeek === 6) || (dayOfWeek === 0)) {
                isWeekend = 1
            }

            timeEncoders['day-of-month'].jsds.set('value', time.getDate() - 1)
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
