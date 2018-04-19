let RelativeScalarEncoder = require('../../../htm/encoders/relativeScalarEncoder')
let ScalarEncoder = require('../../../htm/encoders/scalar')
let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')
let JSDS = require('JSDS')
let utils = require('../../utils')
let html = require('./scalarWindow.tmpl.html')

const onColor = 'skyblue'
const offColor = 'white'
let jsds = JSDS.create('scalar-window')

module.exports = (elementId) => {

    let encoder
    let n = 100
    let resolution = 0.1
    let min = -1
    let max = 1

    let dataStep = 0.25
    let counter = 0
    function nextSemiRandomSineWaveDataPoint() {
        let x = counter
        counter += dataStep
        let value = Math.sin(x)
        let jitter = utils.getRandomArbitrary(0.0, 0.25)
        if (Math.random() > 0.5) value += jitter
        else value -= jitter
        return value
    }

    function fillWindowWithData(window, size) {
        while (window.length < size) {
            window.push(nextSemiRandomSineWaveDataPoint())
        }
        return window
    }

    utils.loadHtml(html.default, elementId, () => {
        let $d3El = d3.select('#' + elementId)

        let width = 560,
            height = 400

        let $svg = $d3El.select('svg')
            .attr('width', width)
            .attr('height', height)

        let windowSize = 100
        let index = 40

        let scaleX = d3.scaleLinear().domain([0, windowSize]).range([10, width - 10])
        let scaleY = d3.scaleLinear().domain([-1, 1]).range([30, height/2 - 30])
        let lineFunction = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .curve(d3.curveCatmullRom.alpha(0.01))
        let rectWidth = 20

        jsds.after('set', 'data', (data) => {
            let lineData = data.map((d, i) => {
                return {
                    x: scaleX(i),
                    y: scaleY(d)
                }
            })
            $svg.select('path#plot')
                .attr('d', lineFunction(lineData))
                .attr('stroke', 'black')
                .attr('fill', 'none')
            $svg.select('rect#index')
                .attr('x', scaleX(index) - rectWidth/2)
                .attr('y', 0)
                .attr('height', 200)
                .attr('width', rectWidth)
                .attr('stroke', 'red')
                .attr('stroke-width', 1)
                .attr('fill', 'none')
                .attr('opacity', 0.25)
            jsds.set('value', data[index])
        })

        jsds.set('data', fillWindowWithData([], windowSize))

        jsds.after('set', 'value', (value) => {
            $svg.select('rect#value')
                .attr('x', scaleX(index) - rectWidth/2)
                .attr('y', scaleY(value) - rectWidth/2)
                .attr('height', rectWidth)
                .attr('width', rectWidth)
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
                .attr('fill', 'none')
                .attr('opacity', 0.5)
            $svg.select('circle#value-dot')
                .attr('cx', scaleX(index))
                .attr('cy', scaleY(value))
                .attr('r', 2)
                .attr('fill', 'red')
                .attr('stroke', 'none')
            let encoding = encoder.encode(value)
            jsds.set('encoding', encoding)
        })

        jsds.after('set', 'encoding', (encoding) => {
            let $sdr = new SdrDrawing(encoding, 'encoding').draw({
                width: width,
                height: height/2
            })
            $sdr.$drawing.attr('transform', 'translate(0,' + height/2 + ')')
        })

        setInterval(() => {
            let data = jsds.get('data')
            data.push(nextSemiRandomSineWaveDataPoint())
            data.shift()
            jsds.set('data', data)
        }, 100)

        encoder = new RelativeScalarEncoder(n, resolution, min, max, bounded=true)

    })

}
