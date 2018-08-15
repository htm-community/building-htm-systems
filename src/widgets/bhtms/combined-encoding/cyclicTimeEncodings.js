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
    onColor: '#DF0024',
    n: 31,
    w: 5,
}, {
    // weekend
    values: 2,
    onColor: '#00AC9F',
    n: 50,
    w: 15,
}, {
    // day of week
    values: 7,
    onColor: '#F3C300',
    n: 70,
    w: 9,
}, {
    // time of day
    values: 24,
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

        let provider = JSDS.get(dataProviderId + '-' + dataProviderId)

        function renderTimeCycles() {
            timeEncoderNames.forEach((name, i) => {
                let prms = timeEncoderParams[i]

                let size = width / 2
                let xOffset = -50
                let yOffset = 0
                let radius = size/2 * .7

                // Each one has same stuff below
                prms.center = {x: size/2 + xOffset, y: size/2 + yOffset}
                prms.size = size
                prms.radius = radius
                prms.offColor = '#303240'
                prms.pointSize = 10
                prms.min = 0
                prms.max = prms.values - 1

                let encoderDisplay = new CyclicEncoderDisplay(elementId + '-' + name, prms)
                timeEncoders[name] = encoderDisplay
                encoderDisplay.jsds.set('text.value', 0)
                encoderDisplay.$svg.select('text.label').html(name)
            })
        }

        function updateDayOfMonthEncoder(time) {
            let dayOfMonth = time.getDate()
            let encoderDisplay = timeEncoders['day-of-month']
            encoderDisplay.jsds.set('value', dayOfMonth)
            encoderDisplay.$svg.select('.value').html(dayOfMonth)
        }
        function updateWeekendEncoder(time) {
            let dayOfWeek = time.getDay()
            let isWeekend = 0
            if ((dayOfWeek === 6) || (dayOfWeek === 0)) {
                isWeekend = 1
            }
            let encoderDisplay = timeEncoders['weekend']
            encoderDisplay.jsds.set('value', isWeekend)
            encoderDisplay.$svg.select('.value').html(isWeekend)
        }

        function updateDayOfWeekEncoder(time) {
            let dayOfWeek = time.getDay()
            let encoderDisplay = timeEncoders['day-of-week']
            encoderDisplay.jsds.set('value', dayOfWeek)
            encoderDisplay.$svg.select('.value').html(dayOfWeek)
        }

        function updateTimeEncoders() {
            let value = provider.get('value');
            let time = value.time

            updateDayOfMonthEncoder(time)
            updateWeekendEncoder(time)
            updateDayOfWeekEncoder(time)

            // let dayOfMonth = time.getDate() - 1
            // let dayOfWeek = time.getDay()
            // let isWeekend = 0
            // let hourOfDay = time.getHours()
            // if ((dayOfWeek === 6) || (dayOfWeek === 0)) {
            //     isWeekend = 1
            // }
            //
            // timeEncoders['day-of-month'].jsds.set('value', dayOfMonth)
            // timeEncoders['weekend'].jsds.set('value', isWeekend)
            // timeEncoders['day-of-week'].jsds.set('value', dayOfWeek)
            // timeEncoders['time-of-day'].jsds.set('value', hourOfDay)
        }

        encoder = new ScalarEncoder({
            w: range, n: scalarBits, min: min, max: max, bounded: true
        })

        renderTimeCycles()

        provider.after('set', 'value', updateTimeEncoders)


    })

}
