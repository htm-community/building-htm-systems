let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./continuousDayNight.tmpl.html')
let Stickman = require('./img/stickman.png')
let Planet = require('./img/planet.png')
let CyclicEncoderDisplay = require('CyclicEncoderDisplay')

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

        const radialOffset = Math.PI
        const width = 560
        const height = 400

        const n = 440

        jsds = JSDS.create('continuousDayNight-' + elementId)
        let mouse

        let $svg = d3.select('#' + elementId + ' svg')
            .attr('width', width)
            .attr('height', height)
        let $stickman = $svg.select('image.stickman')

        // Static components are rendered once

        // render planet
        let earthRadius = 110
        let leftGutter = width / 2 - earthRadius
        let topGutter = height / 2 - earthRadius + 15
        let c = {
            x: leftGutter + earthRadius,
            y: topGutter + earthRadius,
            r: earthRadius,
        }
        let planetSize = earthRadius * 2
        $svg.select('image.planet')
            .attr('x', c.x - earthRadius)
            .attr('y', c.y - earthRadius)
            .attr('height', planetSize)
            .attr('width', planetSize)
            .attr('href', '' + Planet)

        let manWidth = 20
        let manHeight = 50
        $stickman
            .attr('width', manWidth)
            .attr('height', manHeight)
            .attr('x', c.x - manWidth/2)
            .attr('y', c.y - earthRadius - manHeight + 10)
            .attr('href', '' + Stickman)

        let encoderDisplay = new CyclicEncoderDisplay($svg.select('g.continuousDayNight-bits'), {
            resolution: 10,
            w: 21,
            n: 40,
            radius: earthRadius * 1.6,
            center: {
                x: width / 2, y: height / 2,
            },
            onColor: '#333',
            offColor: '#ffff5e',
        })
        encoderDisplay.render()
        encoderDisplay.$svg.attr('transpose', 'transform()')

        encoderDisplay.jsds.after('set', 'encoding', () => {
            encoderDisplay.updateDisplay()
        })
        encoderDisplay.jsds.after('set', 'value', (value) => {
            let encoding = encoderDisplay.encoder.encode(value)
            encoderDisplay.jsds.set('encoding', encoding)
        })

        function renderSun(theta) {
            let $sun = $svg.select('circle.sun')
            let $gradient = $svg.select('#sunGradientContinuous')
            let distance = earthRadius * 12
            let sunRadius = distance * 1.25
            let offset = - Math.PI / 2
            let x = c.x + distance * Math.sin(theta + offset)
            let y = c.y - distance * Math.cos(theta + offset)
            $sun.attr('cx', x)
                .attr('cy', y)
                .attr('r', sunRadius)
            $gradient.attr('cx', x)
                .attr('cy', y)
                .attr('r', sunRadius)
        }

        function renderRay(theta) {
            let $line = $svg.select('line.ray')
            let distance = earthRadius * 2
            let offset = - Math.PI / 2
            let x = c.x + distance * Math.sin(theta + offset)
            let y = c.y - distance * Math.cos(theta + offset)
            $line.attr('x1', c.x)
                 .attr('y1', c.y)
                 .attr('x2', x)
                 .attr('y2', y)
                 .attr('stroke', 'black')
                 .attr('stroke-width', 5)
        }

        function renderCursor() {
            let $sun = $svg.select('circle.cursor')
            let $gradient = $svg.select('#cursorGradientContinuous')
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

            let offset = - Math.PI / 2
            let arc = d3.arc()
                .innerRadius(0)
                .outerRadius(earthRadius)
                .startAngle(theta + offset + Math.PI * 1/2)
                .endAngle(theta + offset + Math.PI * 9/6)

            $shade.attr('d', arc())
                .attr('opacity', 0.5)
                .attr('transform', 'translate(' + c.x + ', ' + c.y + ')')
        }

        function renderEncoding(theta) {
            encoderDisplay.jsds.set('value', theta)
        }

        function onThetaUpdate() {
            let theta = jsds.get('theta')
            // console.log(theta)
            renderSun(theta)
            throwShade(theta)
            // renderRay(theta)
            renderEncoding(theta)
            if (mouse) renderCursor()
        }

        jsds.after('set', 'theta', onThetaUpdate)

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
