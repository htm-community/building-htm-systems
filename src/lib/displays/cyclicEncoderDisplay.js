let CyclicEncoder = require('CyclicEncoder')
let JSDS = require('JSDS')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitStroke: 'black',
}

let absentCircleRadius = 1

class CyclicEncoderDisplay {

    constructor(id, opts) {
        if (typeof id === 'string') {
            this.$svg = d3.select('#' + id)
        } else {
            this.$svg = id
            id = '?'
        }
        this.$group = this.$svg.selectAll('.bits')

        this.id = id
        this.center = opts.center
        this.radius = opts.radius || this.size / 2

        this.onColor = opts.onColor
        this.offColor = opts.offColor

        this.size = opts.size
        this.pointSize = opts.pointSize

        this.width = this.size
        this.height = this.size
        this.$svg.attr('width', this.width)
                 .attr('height', this.size * .78)

        if (id)
            this.jsds = JSDS.create(id)
        else
            this.jsds = JSDS.create()
        this.jsds.set('resolution', opts.resolution)
        this.jsds.set('w', opts.w)
        this.jsds.set('n', opts.n)

        this.encoder = new CyclicEncoder({
            min: opts.min,
            max: opts.max,
            n: opts.n,
            w: opts.w,
        })

        let me = this
        this.jsds.after('set', 'value', () => {
            me.updateDisplay()
        })
    }

    get smallCircleRadius() {
        return this.pointSize
    }

    updateDisplay() {
        let providerValue = this.jsds.get('value');
        let encoding = this.jsds.get('encoding') || this.encoder.encode(providerValue)
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

        let circles = this.$group.selectAll('circle').data(data)
        this._treatCircleBits(circles)

        let newCircles = circles.enter().append('circle')
        this._treatCircleBits(newCircles)

        circles.exit().remove()
    }
}

module.exports = CyclicEncoderDisplay
