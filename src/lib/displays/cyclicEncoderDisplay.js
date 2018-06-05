let CyclicEncoder = require('CyclicEncoder')
let JSDS = require('JSDS')
let utils = require('../utils')

let colors = {
    track: '#CCC',
    bitOff: 'white',
    bitStroke: 'black',
}

// Majic stuph
let maxCircleRadius = 40
let interval = 10 // ms
let cuts = 100

class CyclicEncoderDisplay {

    constructor(id, opts) {
        this.id = id
        this.$svg = d3.select('#' + id)

        this.size = opts.size
        this.color = opts.color

        let $el = $(this.$svg.node())

        this.$valueDisplay = $el.find('.value-display')
        this.$rangeDisplay = $el.find('.range-display')
        this.$resolutionLabel = $el.find('.resolution-display')
        this.$nameLabel = $el.find('.name-label')
        this.$rangeLabel = $el.find('.range-label')

        this.jsds = JSDS.create('cyclic-category-encoder-' + this.id)
        this.jsds.set('values', opts.values)
        this.jsds.set('buckets', opts.buckets)
        this.jsds.set('range', opts.range)

        // State of display
        this.state = opts.state || 'circle'
        // this.state = 'line'
    }

    get radius() {
        return (this.size / 2) * this.largeCircleRatio
    }

    render() {
        let jsds = this.jsds
        let values = jsds.get('values'),
            buckets = jsds.get('buckets'),
            range = jsds.get('range')
        this.encoder = new CyclicEncoder({
            buckets: buckets,
            values: values,
            range: range,
        })
        let $svg = this.$svg
        let size = this.size
        let half = size / 2

        // Some aesthetic stuff. The order is important below because of the radius
        this.largeCircleRatio = 3/4
        this.tinyFont = 12
        this.smallFont = 18
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
        let rangeLabelY = size * .56
        let outDisplay = size * .72
        let resLabelY = size * .78

        this.$valueDisplay.attr('font-size', this.bigFont)
            .html(0)
            .attr('x', half - (this.$valueDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$valueDisplay.get(0).getBBox().height / 4))
        this.$rangeDisplay.attr('font-size', this.medFont)
            .html(range + ' / ' + buckets)
            .attr('x', half - (this.$rangeDisplay.get(0).getBBox().width / 2))
            .attr('y', outDisplay)
        this.$resolutionLabel.attr('font-size', this.tinyFont)
            .html(utils.precisionRound(this.encoder.resolution, 2))
            .attr('x', half - (this.$resolutionLabel.get(0).getBBox().width / 2))
            .attr('y', resLabelY)

        this.$nameLabel.attr('font-size', this.medFont)
            .attr('x', half - (this.$nameLabel.find('tspan').get(0).getBBox().width / 2))
            .attr('y', nameLabelY - (this.$nameLabel.find('tspan').get(0).getBBox().height / 2))
        this.$rangeLabel.attr('font-size', this.smallFont)
            .attr('x', half - (this.$rangeLabel.get(0).getBBox().width / 2))
            .attr('y', rangeLabelY + (this.$rangeLabel.get(0).getBBox().height - 2))

        this._selfListen()
    }

    get smallCircleRadius() {
        let buckets = this.jsds.get('buckets')
        let circumference = 2 * Math.PI * this.radius
        let out
        let displayState = this.state
        if (displayState === 'circle') {
            out = Math.min(circumference / buckets / 2, maxCircleRadius)
        } else if (displayState === 'line-to-circle') {
            out = d3.scaleLinear().domain([0, 1]).range([
                Math.min(this.size / buckets / 2, maxCircleRadius),
                Math.min(circumference / buckets / 2, maxCircleRadius),
            ])(this._transition)
        } else if (displayState === 'line') {
            out = Math.min(this.size / buckets / 2, maxCircleRadius)
        } else if (displayState === 'circle-to-line') {
            out = d3.scaleLinear().domain([0, 1]).range([
                Math.min(circumference / buckets / 2, maxCircleRadius),
                Math.min(this.size / buckets / 2, maxCircleRadius),
            ])(this._transition)
        } else {
            throw new Error('Unknown display format: ' + displayState)
        }
        return out
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
            this._handles.push(jsds.after('set', 'values', reRender))
            this._handles.push(jsds.after('set', 'range', reRender))
            this._handles.push(jsds.after('set', 'buckets', reRender))
        }
    }

    transition(from, to) {
        let me = this
        this.state = from + '-to-' + to
        let count = 0
        this._xhandle = setInterval(() => {
            me._transition = count / cuts
            if (count++ >= cuts) {
                me.state = to
                clearInterval(me._xhandle)
                delete me._transition
            }
            me.updateDisplay()
        }, interval)
    }

    updateDisplay() {
        let value = this.jsds.get('value')
        let values = this.jsds.get('values')
        let encoding = this.encoder.encode(value)
        this.jsds.set('encoding', encoding)
        this.$valueDisplay.html(value + ' / ' + (values - 1))
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
        let buckets = this.jsds.get('buckets'),
            displayState = this.state,
            size = this.size,
            radius = this.radius,
            $svg = this.$svg
        let bucketSpread = (2 * Math.PI) / buckets
        let center = {x: size / 2, y: size / 2}
        let linearScale = d3.scaleLinear()
            .domain([0, encoding.length])
            .range([this.smallCircleRadius, this.smallCircleRadius + size])

        let data = encoding.map((bit, i) => {
            let theta = i * bucketSpread + Math.PI
            let out = {bit: bit}
            if (displayState === 'circle') {
                out.cx = center.x + radius * Math.sin(theta)
                out.cy = center.y + radius * Math.cos(theta)
            } else if (displayState === 'line-to-circle') {
                out.cx = d3.scaleLinear().domain([0, 1]).range([
                    linearScale(i),
                    center.x + radius * Math.sin(theta),
                ])(this._transition)
                out.cy = d3.scaleLinear().domain([0, 1]).range([
                    size / 10,
                    center.y + radius * Math.cos(theta),
                ])(this._transition)
            } else if (displayState === 'line') {
                out.cx = linearScale(i)
                out.cy = size / 10
            } else if (displayState === 'circle-to-line') {
                out.cx = d3.scaleLinear().domain([0, 1]).range([
                    center.x + radius * Math.sin(theta),
                    linearScale(i),
                ])(this._transition)
                out.cy = d3.scaleLinear().domain([0, 1]).range([
                    center.y + radius * Math.cos(theta),
                    size / 10,
                ])(this._transition)
            } else {
                throw new Error('Unknown display format: ' + displayState)
            }
            return out
        })
        let $group = $svg.selectAll('g.bits')

        let circles = $group.selectAll('circle').data(data)
        this._treatCircleBits(circles)

        let newCircles = circles.enter().append('circle')
        this._treatCircleBits(newCircles)

        circles.exit().remove()
    }

    step(increment) {
        let v = this.jsds.get('value')
        v += increment
        if (v > this.jsds.get('values') - 1) v = 0
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
