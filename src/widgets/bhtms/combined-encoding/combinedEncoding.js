let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./combinedEncoding.tmpl.html')

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
    color: '#DF0024',
}, {
    // weekend
    values: 2,
    range: 11,
    buckets: 21,
    color: '#00AC9F',
}, {
    // day of week
    values: 7,
    range: 3,
    buckets: 21,
    color: '#F3C300',
}, {
    // time of day
    values: 24,
    range: 9,
    buckets: 21,
    color: '#2E6DB4',
}]

const onColor = '#555'
const offColor = 'white'

module.exports = (elementId, dataProviderId) => {

    let provider = JSDS.get(dataProviderId + '-' + dataProviderId)

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId)
        let width = 560
        let combinedHeight = 290
        let $combinedEncoding = $d3El.select('svg')
            .attr('width', width)
            .attr('height', combinedHeight)

        function _treatCombinedEncodingBits(rects) {
            let cellsPerRow = 19,
                size = Math.round(width / cellsPerRow),
                leftPad = 2
            rects.attr('class', 'combined')
                .attr('x', (d, i) => {
                    return leftPad + size * (i % cellsPerRow)
                })
                .attr('y', (d, i) => {
                    return Math.floor(i / cellsPerRow) * size
                })
                .attr('width', size)
                .attr('height', size)
                .attr('stroke', 'darkgrey')
                .attr('stroke-width', 0.5)
                .attr('fill', (d, i) => {
                    let typeIndex = timeEncoderNames.indexOf(d.encoder)
                    let color = offColor
                    if (typeIndex < 0 && d.bit === 1) {
                        color = onColor
                    } else if (d.bit === 1) {
                        color = timeEncoderParams[typeIndex].color
                    }
                    return color
                })
        }

        function updateCombinedEncoding() {
            let combinedEncoding = []
            let scalarBits = provider.get('scalar-encoding')
            scalarBits.forEach((bit, i) => {
                combinedEncoding.push({
                    bit: bit,
                    encoder: 'relative-scalar',
                })
            })
            timeEncoderNames.forEach(k => {
                // Each encoder has a specific jsds instance
                let store = JSDS.get('cyclicTimeEncodings-' + k)
                store.set('value', provider.get('value'))
                let encoding = store.get('encoding')
                if (encoding) {
                    encoding.forEach(bit => {
                        combinedEncoding.push({
                            bit: bit,
                            encoder: k,
                        })
                    })
                }
            })

            let $rects = $combinedEncoding.selectAll('rect.combined')
                .data(combinedEncoding)
            _treatCombinedEncodingBits($rects)

            let $newRects = $rects.enter().append('rect')
            _treatCombinedEncodingBits($newRects)

            $rects.exit().remove()
        }

        provider.after('set', 'value', updateCombinedEncoding)

    })

}
