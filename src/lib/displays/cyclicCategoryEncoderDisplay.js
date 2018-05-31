let JSDS = require('JSDS')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitStroke: 'black'
}

class CyclicCategoryEncoderDisplay {

    constructor(id, encoder, opts) {
        this.id = id
        this.$svg = d3.select('#' + id)
        this.encoder = encoder

        this.buckets = opts.buckets
        this.bits = opts.bits
        this.range = opts.range

        this.size = opts.size
        this.color = opts.color

        let $el = $(this.$svg.node())

        this.$minDisplay = $el.find('.min-display')
        this.$valueDisplay = $el.find('.value-display')
        this.$maxDisplay = $el.find('.max-display')
        this.$rangeDisplay = $el.find('.range-display')
        this.$nameLabel = $el.find('.name-label')
        this.$minLabel = $el.find('.min-label')
        this.$maxLabel = $el.find('.max-label')
        this.$rangeLabel = $el.find('.range-label')

        // Some aesthetic stuff. The order is important below because of the radius
        this.largeCircleRatio = 3/4
        this.smallCircleRatio = this.radius / 7
        this.smallFont = 20
        this.medFont = 26
        this.bigFont = 60
        this.circleStrokeWidth = 3
        if (this.size < 200) {
            this.largeCircleRatio = 8/9
            this.smallCircleRatio = this.radius / 8
            this.smallFont = 11
            this.medFont = 13
            this.bigFont = 28
            this.circleStrokeWidth = 1
        }
    }

    get radius() {
        return (this.size / 2) * this.largeCircleRatio
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

        let third = size * 3/10
        let twoThirds = size * 21/30
        let fourth = size / 4
        let threeFourths = size * 3/4

        this.$valueDisplay.attr('font-size', this.bigFont)
            .html(0)
            .attr('x', half - (this.$valueDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$valueDisplay.get(0).getBBox().height / 4))
        this.$minDisplay.attr('font-size', this.smallFont)
            .html(0)
            .attr('x', fourth - (this.$minDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$minDisplay.get(0).getBBox().height / 4))
        this.$maxDisplay.attr('font-size', this.smallFont)
            .html(this.buckets - 1)
            .attr('x', threeFourths - (this.$maxDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$maxDisplay.get(0).getBBox().height / 4))
        this.$rangeDisplay.attr('font-size', this.medFont)
            .html(this.range + '/' + this.bits)
            .attr('x', half - (this.$rangeDisplay.get(0).getBBox().width / 2))
            .attr('y', twoThirds)

        this.$nameLabel.attr('font-size', this.medFont)
            .attr('x', half - (this.$nameLabel.find('tspan').get(0).getBBox().width / 2))
            .attr('y', third)
        this.$minLabel.attr('font-size', this.smallFont)
            .attr('x', fourth - (this.$minLabel.get(0).getBBox().width / 2))
            .attr('y', half + (this.$minLabel.get(0).getBBox().height + 2))
        this.$maxLabel.attr('font-size', this.smallFont)
            .attr('x', threeFourths - (this.$maxLabel.get(0).getBBox().width / 2))
            .attr('y', half + (this.$maxLabel.get(0).getBBox().height + 2))
        this.$rangeLabel.attr('font-size', this.smallFont)
            .attr('x', half - (this.$rangeLabel.get(0).getBBox().width / 2))
            .attr('y', twoThirds + (this.$rangeLabel.get(0).getBBox().height - 2))



        this.jsds = JSDS.create('cyclic-category-encoder-' + this.id)
        this.jsds.after('set', 'value', () => {
            me.updateDisplay.call(me)
        })
    }

    updateDisplay() {
        let value = this.jsds.get('value')
        let encoding = this.encoder.encode(value)
        this.$valueDisplay.html(value)
        // console.log(encoding)
        this._updateCircles(encoding)
    }

    _treatCircleBits(circles) {
        let color = this.color
        circles
            .attr('cx', d => d.cx)
            .attr('cy', d => d.cy)
            .attr('r', this.smallCircleRatio)
            .attr('fill', d => {
                if (d.bit) return color
                else return colors.bitOff
            })
            .attr('stroke', colors.bitStroke)
            .attr('stroke-width', this.circleStrokeWidth)
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
        // console.log(data)
        this._treatCircleBits(circles)

        let newCircles = circles.enter().append('circle')
        this._treatCircleBits(newCircles)

        circles.exit().remove()
    }

    step(increment) {
        let v = this.jsds.get('value')
        v += increment
        if (v > this.buckets - 1) v = 0
        this.jsds.set('value', v)
    }

    loop() {
        let me = this
        setInterval(() => {
            me.step(1)
        }, 300)
    }

}

module.exports = CyclicCategoryEncoderDisplay
