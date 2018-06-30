let CyclicEncoder = require('CyclicEncoder')
let JSDS = require('JSDS')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitStroke: 'black',
}

// Majic stuph
let maxCircleRadius = 40
let minCircleRadius = 10

class TransparentCyclicEncoderDisplay {

    constructor(id, opts) {
        if (typeof id === 'string') {
            this.$svg = d3.select('#' + id)
        } else {
            this.$svg = id
            id = '?'
        }

        this.id = id
        this.radius = opts.radius
        this.center = opts.center
        this.onColor = opts.onColor
        this.offColor = opts.offColor

        try {
            this.jsds = JSDS.create('TransparentCyclicEncoderDisplay-' + this.id)
        } catch (e) {
            this.jsds = JSDS.get('TransparentCyclicEncoderDisplay-' + this.id)
            if (! this.jsds) throw new Error('Cannot get JSDS!')
        }
        this.jsds.set('resolution', opts.resolution)
        this.jsds.set('w', opts.w)
        this.jsds.set('n', opts.n)

        this.encoder = new CyclicEncoder({
            min: 2 * Math.PI,
            max: 0,
            n: opts.n,
            w: opts.w,
        })
    }

    render() {
        let $svg = this.$svg
        let size = this.size

        // Some aesthetic stuff. The order is important below because of the radius
        this.largeCircleRatio = 1
        this.circleStrokeWidth = 2
        if (this.size < 200) {
            this.largeCircleRatio = 8/9
            this.circleStrokeWidth = 1
        }
        $svg.attr('width', size)
    }

    get smallCircleRadius() {
        let buckets = this.encoder.n
        let circumference = 2 * Math.PI * this.radius
        let out = Math.min(circumference / buckets / 2, maxCircleRadius)
        out = Math.max(out, minCircleRadius)
        return out
    }

    updateDisplay() {
        let size = this.size
        let value = this.jsds.get('value')
        let encoding = this.jsds.get('encoding') || this.encoder.encode(value)
        this._updateCircles(encoding)
        this.$svg.attr('height', size)
    }

    _treatCircleBits(circles) {
        let me = this
        circles
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('r', this.smallCircleRadius)
            .attr('fill', d => {
                if (d.bit) return me.offColor
                else return me.onColor
            })
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
                cy: center.y + radius * Math.cos(theta)
            }
        })

        let circles = this.$svg.selectAll('circle').data(data)
        this._treatCircleBits(circles)

        let newCircles = circles.enter().append('circle')
        this._treatCircleBits(newCircles)

        circles.exit().remove()
    }
}

module.exports = TransparentCyclicEncoderDisplay
