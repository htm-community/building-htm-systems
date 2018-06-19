let CategoryEncoder = require('CategoryEncoder')
let JSDS = require('JSDS')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitStroke: 'black',
}

// Majic stuph
let maxCircleRadius = 40
let minCircleRadius = 10

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

    get center() {
        return {x: this.size / 2, y: this.size / 2}
    }

    render() {
        let $svg = this.$svg
        let size = this.size

        // Some aesthetic stuff. The order is important below because of the radius
        this.largeCircleRatio = .7
        this.bigFont = 60
        this.circleStrokeWidth = 2
        if (this.size < 200) {
            this.largeCircleRatio = 8/9
            this.bigFont = 28
            this.circleStrokeWidth = 1
        }

        let $el = $(this.$svg.node())
        this.$valueDisplay = $el.find('.value-display')

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
        this._updateLabels(value)
        this._updateCircles(encoding)
        this.$svg.attr('height', size)
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
        let radius = this.radius
        let center = this.center
        let wedge = (2 * Math.PI) / this.encoder.n

        let $svg = this.$svg
        let $group = $svg.selectAll('g.bits')

        let data = encoding.map((bit, i) => {
            // Adding pi starts it at the top of the circle (180 into it)
            let theta = i * wedge + Math.PI
            return {
                bit: bit,
                cx: center.x + radius * Math.sin(theta),
                cy: center.y + radius * Math.cos(theta)
            }
        })

        let circles = $group.selectAll('circle').data(data)
        this._treatCircleBits(circles)

        let newCircles = circles.enter().append('circle')
        this._treatCircleBits(newCircles)

        circles.exit().remove()
    }

    _treatLabels(labels) {
        labels
            .attr('class', 'label')
            .attr('x', (d, i, texts) => {
                let width = texts[i].getBBox().width
                return d.x - width/2
            })
            .attr('y', (d, i, texts) => {
                let height = texts[i].getBBox().height
                return d.y + height/2
            })
            .attr('color', 'black')
            .html(d => d.name)
    }

    _updateLabels(value) {
        let $valueDisplay = this.$valueDisplay
        this.$valueDisplay.html(value)
        let center = this.center
        let valueX = center.x - ($valueDisplay.get(0).getBBox().width / 2)
        let valueY = center.y + ($valueDisplay.get(0).getBBox().height / 2)
        $valueDisplay
            .attr('font-size', this.bigFont)
            .attr('x', valueX)
            .attr('y', valueY)
        let categories = this.encoder.categories
        let radius = this.radius + this.smallCircleRadius + 30
        let wedge = (2 * Math.PI) / categories.length
        let data = categories.map((category, index) => {
            // The + Math.PI rotates the labels 180 degress to match the circles above
            let theta = index * wedge + Math.PI
            // Add another half wedge to get to the midpoint
            theta = theta + wedge/2
            return {
                name: category,
                active: category === value,
                x: center.x + radius * Math.sin(theta),
                y: center.y + radius * Math.cos(theta),
            }
        })

        let $group = this.$svg.selectAll('g.labels')

        let labels = $group.selectAll('text.label').data(data)
        this._treatLabels(labels)

        let newLabels = labels.enter().append('text')
        this._treatLabels(newLabels)

        labels.exit().remove()
    }

}

module.exports = CategoryEncoderDisplay
