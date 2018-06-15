let CategoryEncoder = require('CategoryEncoder')
let JSDS = require('JSDS')
let utils = require('../utils')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitStroke: 'black',
}

// Majic stuph
let maxCircleRadius = 40

class CategoryEncoderDisplay {

    constructor(id, opts) {
        if (typeof id === 'string') {
            this.$svg = d3.select('#' + id)
        } else {
            this.$svg = id
            id = '?'
        }

        this.id = id
        this.size = opts.size
        this.color = opts.color

        try {
            this.jsds = JSDS.create('CategoryEncoderDisplay-' + this.id)
        } catch (e) {
            this.jsds = JSDS.get('CategoryEncoderDisplay-' + this.id)
            if (! this.jsds) throw new Error('Cannot get JSDS!')
        }
        this.jsds.set('categories', opts.categories)
        this.jsds.set('w', opts.w)

        this.encoder = new CategoryEncoder({
            categories: opts.categories,
            w: opts.w,
        })
    }

    get radius() {
        return (this.size / 2) * this.largeCircleRatio
    }

    render() {
        let $svg = this.$svg,
            size = this.size,
            half = size / 2;

        // Some aesthetic stuff. The order is important below because of the radius
        this.largeCircleRatio = 3/4
        this.medFont = 26
        this.bigFont = 60
        this.circleStrokeWidth = 2
        if (this.size < 200) {
            this.largeCircleRatio = 8/9
            this.medFont = 13
            this.bigFont = 28
            this.circleStrokeWidth = 1
        }

        let $el = $(this.$svg.node())
        this.$valueDisplay = $el.find('.value-display')
        this.$nameLabel = $el.find('.name-label')

        $svg.attr('width', size)

        let nameLabelY = size * .37

        this.$valueDisplay.attr('font-size', this.bigFont)
            .attr('x', half - (this.$valueDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$valueDisplay.get(0).getBBox().height / 4))
            .html(0)

        this.$nameLabel.attr('font-size', this.medFont)
            .attr('x', half - (this.$nameLabel.find('tspan').get(0).getBBox().width / 2))
            .attr('y', nameLabelY - (this.$nameLabel.find('tspan').get(0).getBBox().height / 2))
    }

    get smallCircleRadius() {
        let buckets = this.encoder.n
        let circumference = 2 * Math.PI * this.radius
        return Math.min(circumference / buckets / 2, maxCircleRadius)
    }

    updateDisplay() {
        let size = this.size
        let value = this.jsds.get('value')
        let encoding = this.jsds.get('encoding') || this.encoder.encode(value)
        this.$valueDisplay.html(value)
        let half = this.size / 2
        this.$valueDisplay
            .attr('x', half - (this.$valueDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$valueDisplay.get(0).getBBox().height / 4))
        this.$svg.attr('height', size)
        this._updateCircles(encoding)
    }

    _treatCircleBits(circles) {
        let color = this.color
        circles
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('r', this.smallCircleRadius)
            .attr('fill', d => {
                if (d.bit) return color
                else return colors.bitOff
            })
            .attr('stroke', colors.bitStroke)
            .attr('stroke-width', this.circleStrokeWidth)
    }

    _updateCircles(encoding) {
        let buckets = this.encoder.n,
            size = this.size,
            radius = this.radius,
            $svg = this.$svg,
            bucketSpread = (2 * Math.PI) / buckets,
            center = {x: size / 2, y: size / 2}

        let data = encoding.map((bit, i) => {
            // Adding pi starts it at the top of the circle (180 into it)
            let theta = i * bucketSpread + Math.PI
            return {
                bit: bit,
                cx: center.x + radius * Math.sin(theta),
                cy: center.y + radius * Math.cos(theta)
            }
        })
        let $group = $svg.selectAll('g.bits')

        let circles = $group.selectAll('circle').data(data)
        this._treatCircleBits(circles)

        let newCircles = circles.enter().append('circle')
        this._treatCircleBits(newCircles)

        circles.exit().remove()
    }

}

module.exports = CategoryEncoderDisplay
