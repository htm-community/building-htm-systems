let CyclicEncoder = require('CyclicEncoder')
let JSDS = require('JSDS')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitStroke: 'black',
}

class CyclicEncoderDisplay {

    constructor(id, opts) {
        this.id = id
        this.$svg = d3.select('#' + id)

        this.size = opts.size
        this.color = opts.color

        let $el = $(this.$svg.node())

        this.$valueDisplay = $el.find('.value-display')
        this.$rangeDisplay = $el.find('.range-display')
        this.$nameLabel = $el.find('.name-label')
        this.$rangeLabel = $el.find('.range-label')

        this.jsds = JSDS.create('cyclic-category-encoder-' + this.id)
        this.jsds.set('buckets', opts.buckets)
        this.jsds.set('bits', opts.bits)
        this.jsds.set('range', opts.range)
    }

    get radius() {
        return (this.size / 2) * this.largeCircleRatio
    }

    render() {
        let jsds = this.jsds
        let bits = jsds.get('bits'),
            buckets = jsds.get('buckets'),
            range = jsds.get('range')
        this.encoder = new CyclicEncoder({
            bits: bits,
            buckets: buckets,
            range: range,
        })
        let $svg = this.$svg
        let size = this.size
        let half = size / 2

        // Some aesthetic stuff. The order is important below because of the radius
        this.largeCircleRatio = 3/4
        let radius = this.radius
        let circumference = 2 * Math.PI * radius
        this.smallCircleRadius = circumference / bits / 2
        this.smallFont = 20
        this.medFont = 26
        this.bigFont = 60
        this.circleStrokeWidth = 2
        if (this.size < 200) {
            this.largeCircleRatio = 8/9
            this.smallFont = 11
            this.medFont = 13
            this.bigFont = 28
            this.circleStrokeWidth = 1
        }


        $svg.attr('width', size)
            .attr('height', size)

        let nameLabelY = size * .37
        let rangeDisplayY = size * .76
        let rangeLabelY = size * .58

        this.$valueDisplay.attr('font-size', this.bigFont)
            .html(0)
            .attr('x', half - (this.$valueDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$valueDisplay.get(0).getBBox().height / 4))
        this.$rangeDisplay.attr('font-size', this.medFont)
            .html(range + '/' + bits)
            .attr('x', half - (this.$rangeDisplay.get(0).getBBox().width / 2))
            .attr('y', rangeDisplayY)

        this.$nameLabel.attr('font-size', this.medFont)
            .attr('x', half - (this.$nameLabel.find('tspan').get(0).getBBox().width / 2))
            .attr('y', nameLabelY - (this.$nameLabel.find('tspan').get(0).getBBox().height / 2))
        this.$rangeLabel.attr('font-size', this.smallFont)
            .attr('x', half - (this.$rangeLabel.get(0).getBBox().width / 2))
            .attr('y', rangeLabelY + (this.$rangeLabel.get(0).getBBox().height - 2))

        this._selfListen()
    }

    _selfListen() {
        let me = this
        if (! this._handles) {
            let jsds = this.jsds
            this._handles = []
            function reRender() {
                // If the value is out of range, we gotta push it back into range.
                let value = me.jsds.get('value')
                let buckets = me.jsds.get('buckets')
                if (value < 0) value = 0
                if (value >= buckets) value = buckets - 1
                me.render()
                me.updateDisplay()
            }
            jsds.after('set', 'value', () => {
                me.updateDisplay()
            })
            this._handles.push(jsds.after('set', 'buckets', reRender))
            this._handles.push(jsds.after('set', 'range', reRender))
            this._handles.push(jsds.after('set', 'bits', reRender))
        }
    }

    updateDisplay() {
        let value = this.jsds.get('value')
        let buckets = this.jsds.get('buckets')
        let encoding = this.encoder.encode(value)
        this.jsds.set('encoding', encoding)
        this.$valueDisplay.html(value)
        let half = this.size / 2
        this.$valueDisplay
            .attr('x', half - (this.$valueDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$valueDisplay.get(0).getBBox().height / 4))
        // console.log(encoding)
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
        let bits = this.jsds.get('bits'),
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
        if (v > this.jsds.get('buckets') - 1) v = 0
        this.jsds.set('value', v)
    }

    loop() {
        let me = this
        this._loopHandle = setInterval(() => {
            me.step(1)
        }, 300)
    }

    stop() {
        if (this._loopHandle) {
            window.clearInterval(this._loopHandle)
            delete this._loopHandle
        }
    }

}

module.exports = CyclicEncoderDisplay
