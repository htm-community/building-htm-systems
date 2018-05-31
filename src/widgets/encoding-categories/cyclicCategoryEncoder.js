let JSDS = require('JSDS')
let utils = require('../utils')
let html = require('./cyclicCategoryEncoder.tmpl.html')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitOn: 'orange',
    bitStroke: 'black'
}

class CyclicCategoryEncoderDisplay {

    constructor(id, $svg, encoder, opts) {
        this.id = id
        this.$svg = $svg
        this.encoder = encoder

        this.size = opts.size
        this.min = opts.min
        this.max = opts.max
        this.bits = opts.bits
        this.range = opts.range

        let $el = $($svg.node())

        this.$minDisplay = $el.find('.min-display')
        this.$valueDisplay = $el.find('.value-display')
        this.$maxDisplay = $el.find('.max-display')
        this.$rangeDisplay = $el.find('.range-display')
        this.$nameLabel = $el.find('.name-label')
        this.$minLabel = $el.find('.min-label')
        this.$valueLabel = $el.find('.value-label')
        this.$maxLabel = $el.find('.max-label')
        this.$rangeLabel = $el.find('.range-label')
    }

    render() {
        let me = this
        let $svg = this.$svg
        let size = this.size
        let half = size / 2
        let radius = this.radius

        $svg.attr('width', size)
            .attr('height', size)
        $svg.select('circle.track')
            .attr('cx', half)
            .attr('cy', half)
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', colors.track)

        this.$nameLabel
            .attr('x', half)
            .attr('y', size * 1/3)
        this.$minLabel
            .attr('x', size * 1/3)
            .attr('y', half + 20)
        this.$valueLabel
            .attr('x', half)
            .attr('y', half + 20)
        this.$maxLabel
            .attr('x', size * 2/3)
            .attr('y', half + 20)
        this.$rangeLabel
            .attr('x', half)
            .attr('y', size * 2/3 + 20)

        this.$valueDisplay
            .attr('x', half)
            .attr('y', half)
        this.$valueLabel
            .attr('x', half)
            .attr('y', half)
        this.$minDisplay
            .attr('x', half / 2)
            .attr('y', half)
            .html(this.min)
        this.$maxDisplay
            .attr('x', size * 3/4)
            .attr('y', half)
            .html(this.max)

        this.$rangeDisplay
            .attr('x', half)
            .attr('y', size * 2/3)
            .html(this.range + '/' + this.bits)

        this.jsds = JSDS.create('cyclic-category-encoder-' + this.id)
        this.jsds.after('set', 'value', () => {
            me.updateDisplay.call(me)
        })
    }

    updateDisplay() {
        let value = this.jsds.get('value')
        console.log(value)
        let encoding = this.encoder.encode(value)
        this.$valueDisplay.html(value)
        this._updateCircles(encoding)
    }

    _treatCircleBits(circles) {
        circles
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('r', this.radius / 8)
            .attr('fill', d => {
                if (d.bit) return colors.bitOn
                else return colors.bitOff
            })
            .attr('stroke', colors.bitStroke)
            .attr('stroke-width', 3)
    }

    _updateCircles(encoding) {
        let bits = this.bits,
            size = this.size,
            radius = this.radius,
            $svg = this.$svg
        let bucketSpread = (2 * Math.PI) / bits
        let center = {x: size / 2, y: size / 2}
        let data = encoding.map((bit, i) => {
            let theta = i * bucketSpread
            return {
                bit: bit,
                cx: center.x + radius * Math.sin(theta),
                cy: center.y + radius * Math.cos(theta),
            }
        })
        let $group = $svg.selectAll('g.bits')
        let circles = $group.selectAll('circle').data(data)
        this._treatCircleBits(circles)

        let newCircles = circles.enter().append('circle')
        this._treatCircleBits(newCircles)

        circles.exit().remove()
    }

    get radius() {
        return (this.size / 2) * 3/4
    }

}

class CyclicCategoryEncoder {

    constructor(min, max, range, bits) {
        this.min = min
        this.max = max
        this.range = range
        this.bits = bits
        this.scale = d3.scaleLinear()
            .domain([min, max])
            .range([0, bits])
    }

    encode(value) {
        let out = []
        d3.range(0, this.bits).forEach(() => { out.push(0) })
        let index = this.scale(value)
        out[index] = 1
        for (let i = 0; i < this.range; i++) {
            let rangeIndex = index + i
            if (rangeIndex > out.length) {
                rangeIndex -= out.length
            }
            out[rangeIndex] = 1
        }
        return out
    }
}

module.exports = (elementId) => {

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId),
            $svg = $d3El.select('svg')

        let size = 300

        let min = 0,
            max = 6,
            bits = 12,
            range = 3

        let encoder = new CyclicCategoryEncoder(min, max, range, bits)

        let encoderDisplay = new CyclicCategoryEncoderDisplay('1', $svg, encoder, {
            size: size,
            min: min,
            max: max,
            bits: bits,
            range: range,
        })
        encoderDisplay.render()

        let counter = min

        setInterval(() => {
            encoderDisplay.jsds.set('value', counter++)
            if (counter >= max) counter = 0
        }, 300)

    })

}
