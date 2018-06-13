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

let lineStateHeight = 50

class CyclicEncoderDisplay {

    constructor(id, opts) {
        if (typeof id === 'string')
            this.$svg = d3.select('#' + id)
        else
            this.$svg = id

        this.id = id
        this.size = opts.size
        this.color = opts.color

        try {
            this.jsds = JSDS.create('cyclic-category-encoder-' + this.id)
        } catch (e) {
            this.jsds = JSDS.get('cyclic-category-encoder-' + this.id)
            if (! this.jsds) throw new Error('Cannot get JSDS!')
        }
        this.jsds.set('resolution', opts.resolution)
        this.jsds.set('n', opts.n)
        this.jsds.set('w', opts.w)

        // State of display
        this.display = opts.display || 'circle'
        // this.display = 'line'
        this.encoder = new CyclicEncoder({
            resolution: opts.resolution,
            n: opts.n,
            w: opts.w,
        })
    }

    get radius() {
        return (this.size / 2) * this.largeCircleRatio
    }

    render() {
        let jsds = this.jsds,
            n = jsds.get('n'),
            w = jsds.get('w'),
            $svg = this.$svg,
            size = this.size,
            half = size / 2;

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

        let $el = $(this.$svg.node())
        this.$valueDisplay = $el.find('.value-display')
        this.$nameLabel = $el.find('.name-label')

        $svg.attr('width', size)

        this._circleToLineScaleY = d3.scaleLinear()
            .domain([0, 1])
            .range([size, lineStateHeight])
        this._lineToCircleScaleY = d3.scaleLinear()
            .domain([0, 1])
            .range([lineStateHeight, size])

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
        let buckets = this.jsds.get('n')
        let circumference = 2 * Math.PI * this.radius
        let out
        let displayState = this.display
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

    transition(from, to) {
        let me = this
        this.display = from + '-to-' + to
        let count = 0
        this._xhandle = setInterval(() => {
            me._transition = count / cuts
            if (count++ >= cuts) {
                me.display = to
                clearInterval(me._xhandle)
                delete me._transition
            }
            me.updateDisplay()
        }, interval)
    }

    updateDisplay() {
        let displayState = this.display
        let me = this
        let size = this.size
        let value = this.jsds.get('value')
        let encoding = this.jsds.get('encoding') || this.encoder.encode(value)
        let maxRange = Math.floor(this.encoder.inputDomain[1])
        this.$valueDisplay.html(value + ' / ' + maxRange)
        let half = this.size / 2
        this.$valueDisplay
            .attr('x', half - (this.$valueDisplay.get(0).getBBox().width / 2))
            .attr('y', half + (this.$valueDisplay.get(0).getBBox().height / 4))
        // console.log(encoding)
        this.$svg.attr('height', () => {
            if (displayState === 'circle') {
                return size
            } else if (displayState === 'line') {
                return lineStateHeight
            } else if (displayState === 'circle-to-line') {
                return me._circleToLineScaleY(me._transition)
            } else if (displayState === 'line-to-circle') {
                return me._lineToCircleScaleY(me._transition)
            } else {
                throw new Error('Unknown display state ' + displayState)
            }
        })
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
        let buckets = this.jsds.get('n'),
            displayState = this.display,
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
            let ratioToTop = size / 20
            if (displayState === 'circle') {
                out.cx = center.x + radius * Math.sin(theta)
                out.cy = center.y + radius * Math.cos(theta)
            } else if (displayState === 'line-to-circle') {
                out.cx = d3.scaleLinear().domain([0, 1]).range([
                    linearScale(i),
                    center.x + radius * Math.sin(theta),
                ])(this._transition)
                out.cy = d3.scaleLinear().domain([0, 1]).range([
                    ratioToTop,
                    center.y + radius * Math.cos(theta),
                ])(this._transition)
            } else if (displayState === 'line') {
                out.cx = linearScale(i)
                out.cy = ratioToTop
            } else if (displayState === 'circle-to-line') {
                out.cx = d3.scaleLinear().domain([0, 1]).range([
                    center.x + radius * Math.sin(theta),
                    linearScale(i),
                ])(this._transition)
                out.cy = d3.scaleLinear().domain([0, 1]).range([
                    center.y + radius * Math.cos(theta),
                    ratioToTop,
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
        if (! this.jsds.get('value')) this.jsds.set('value', 0)
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
