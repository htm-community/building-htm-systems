let CyclicEncoder = require('CyclicEncoder')
let JSDS = require('JSDS')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitStroke: 'black',
}

// Majic stuph
let maxCircleRadius = 100
let minCircleRadius = 4
let absentCircleRadius = 1

let min = 2 * Math.PI
let max = 0

class CyclicEncoderDisplay {

    constructor(id, opts) {
        if (typeof id === 'string') {
            this.$svg = d3.select('#' + id + ' .bits')
        } else {
            this.$svg = id
            id = '?'
        }

        this.id = id
        this.radius = opts.radius
        this.center = opts.center
        this.onColor = opts.onColor
        this.offColor = opts.offColor
        this.size = opts.size
        this.radius = opts.radius || this.size / 2
        this.pointSize = opts.pointSize

        if (id)
            this.jsds = JSDS.create(id)
        else
            this.jsds = JSDS.create()
        this.jsds.set('resolution', opts.resolution)
        this.jsds.set('w', opts.w)
        this.jsds.set('n', opts.n)

        this.encoder = new CyclicEncoder({
            min: min,
            max: max,
            n: opts.n,
            w: opts.w,
        })

        this.scale = d3.scaleLinear()
            .domain([opts.min, opts.max])
            .range([min, max])

        let me = this
        this.jsds.after('set', 'value', () => {
            me.updateDisplay()
        })
    }

    render() {
        let $svg = this.$svg
        let size = this.size

        // Some aesthetic stuff. The order is important below because of the radius
        this.largeCircleRatio = 1
        this.circleStrokeWidth = 1
        if (this.size < 50) {
            this.largeCircleRatio = 8/9
            this.circleStrokeWidth = 1
        }
        $svg.attr('width', size)
            .attr('height', size)
    }

    get smallCircleRadius() {
        return this.pointSize
    }

    updateDisplay() {
        let providerValue = this.jsds.get('value');
        let scaledValue = this.scale(providerValue)
        let encoding = this.jsds.get('encoding') || this.encoder.encode(scaledValue)
        this._updateCircles(encoding)
    }

    _treatCircleBits(circles) {
        let me = this
        circles
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('r', (d) => {
                if (d.bit === 0) return absentCircleRadius
                else return me.smallCircleRadius
            })
            .attr('fill', me.onColor)
            .attr('stroke', colors.bitStroke)
            .attr('stroke-width', this.circleStrokeWidth)
    }

    _updateCircles(encoding) {
        let radius = this.radius
        let center = this.center
        let wedge = (2 * Math.PI) / this.encoder.n

        let data = encoding.map((bit, i) => {
            // Adding pi starts it at the top of the circle (180 into it)
            let theta = i * wedge + Math.PI
            return {
                bit: bit,
                cx: center.x + radius * Math.sin(theta),
                cy: center.y + radius * Math.cos(theta),
            }
        })

        let circles = this.$svg.selectAll('circle').data(data)
        this._treatCircleBits(circles)

        let newCircles = circles.enter().append('circle')
        this._treatCircleBits(newCircles)

        circles.exit().remove()
    }
}

module.exports = CyclicEncoderDisplay
