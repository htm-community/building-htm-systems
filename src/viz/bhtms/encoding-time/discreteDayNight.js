let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./discreteDayNight.tmpl.html')
let SdrDrawing = require('SdrDrawing')
let Stickman = require('./img/stickman.png')
let Planet = require('./img/planet.png')

let animationHandle
let jsds

function startAnimation() {
    let speed = 50
    let interval = 2*Math.PI / 180
    let current = jsds.get('theta') || 2*Math.PI

    // Ignore calls to start if already started
    if (animationHandle) return

    animationHandle = setInterval(() => {
        jsds.set('theta', current)
        current -= interval
        if (current < 0) current = 2*Math.PI
    }, speed)
}

function pauseAnimation() {
    clearInterval(animationHandle)
    animationHandle = undefined
}

function render(elementId) {

    utils.loadHtml(html.default, elementId, () => {

        const radialOffset = Math.PI / 2
        const width = 560
        const height = 400

        const n = 440

        jsds = JSDS.create('discreteDayNight-' + elementId)
        let mouse

        let $svg = d3.select('#' + elementId + ' svg')
            .attr('width', width)
            .attr('height', height)

        // Static components are rendered once

        // render planet
        let leftGutter = 60
        let topGutter = 90
        let radius = 110
        let c = {
            x: leftGutter + radius,
            y: topGutter + radius,
            r: radius,
        }
        let planetSize = radius * 2
        $svg.select('image.planet')
            .attr('x', c.x - radius)
            .attr('y', c.y - radius)
            .attr('height', planetSize)
            .attr('width', planetSize)
            .attr('href', '' + Planet)

        let $stickman = $svg.select('image.stickman')
        let manWidth = 20
        let manHeight = 50
        $stickman
            .attr('width', manWidth)
            .attr('height', manHeight)
            .attr('x', c.x - manWidth/2)
            .attr('y', c.y - radius - manHeight + 10)
            .attr('href', '' + Stickman)

        function renderSun(theta) {
            let $sun = $svg.select('circle.sun')
            let $gradient = $svg.select('#sunGradientDiscrete')
            let distance = radius * 12
            let sunRadius = distance * 1.25
            let x = c.x + distance * Math.sin(theta)
            let y = c.y - distance * Math.cos(theta)
            $sun.attr('cx', x)
                .attr('cy', y)
                .attr('r', sunRadius)
            $gradient.attr('cx', x)
                .attr('cy', y)
                .attr('r', sunRadius)
        }

        function renderCursor() {
            let $sun = $svg.select('circle.cursor')
            let $gradient = $svg.select('#cursorGradientDiscrete')
            let cursorRadius = 20
            $sun.attr('cx', mouse[0])
                .attr('cy', mouse[1])
                .attr('r', cursorRadius)
            $gradient.attr('cx', mouse[0])
                .attr('cy', mouse[1])
                .attr('r', cursorRadius)
        }

        function throwShade(theta) {
            let $shade = $svg.select('path.shade')

            let arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius)
                .startAngle(theta + Math.PI * 1/2)
                .endAngle(theta + Math.PI * 9/6)

            $shade.attr('d', arc())
                .attr('opacity', 0.5)
                .attr('transform', 'translate(' + c.x + ', ' + c.y + ')')
        }

        function renderEncoding() {
            let width = 200
            let height = 200
            let encoding = jsds.get('encoding')
            let drawing = new SdrDrawing(encoding, 'binary-planet-encoding-out')
            drawing.draw({
                width: width,
                height: height,
            })
        }

        function encode(value) {
            let dayStart = Math.PI / 2
            let dayEnd = dayStart + Math.PI
            let isDay = dayStart < value && value < dayEnd
            return d3.range(0, n).map(i => {
                let isDayBit = i >= (n/2)
                if (isDayBit && isDay) return 1
                if (!isDayBit && !isDay) return 1
                return 0
            })
        }

        function onThetaUpdate() {
            let theta = jsds.get('theta')
            // console.log(theta)
            renderSun(theta)
            throwShade(theta)
            if (mouse) renderCursor()
            let encoding = encode(theta)
            jsds.set('encoding', encoding)
        }

        jsds.after('set', 'theta', onThetaUpdate)
        jsds.after('set', 'encoding', renderEncoding)

        $svg.on('mouseenter', () => {
            pauseAnimation()
            $svg.select('circle.cursor').style('opacity', 1)
        })
        $svg.on('mouseleave', () => {
            $svg.select('circle.cursor').style('opacity', 0)
            startAnimation()
        })
        $svg.on('mousemove', () => {
            mouse = d3.mouse($svg.node())
            let x = mouse[0] - c.x
            let y = mouse[1] - c.y
            let theta = Math.atan2(y, x) + radialOffset
            jsds.set('theta', theta)
        })

        startAnimation()

    })

}

// It's a hack!
render.startAnimation = startAnimation
render.pauseAnimation = pauseAnimation
module.exports = render
