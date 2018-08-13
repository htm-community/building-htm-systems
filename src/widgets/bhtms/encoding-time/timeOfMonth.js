let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./timeOfMonth.tmpl.html')
let Planet = require('./img/planet.png')
let Moon = require('./img/moon.png')
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

        jsds = JSDS.create('timeOfMonth-' + elementId)
        let mouse

        let $svg = d3.select('#' + elementId + ' svg')
            .attr('width', width)
            .attr('height', height)
        // Static components are rendered once

        // render planet
        let earthRadius = 50
        let leftGutter = width / 2 - earthRadius
        let topGutter = height / 2 - earthRadius
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

        // Render moon
        let moonRadius = earthRadius * 3/8
        let $moon = $svg.select('image.moon')
            .attr('width', moonRadius * 2)
            .attr('height', moonRadius * 2)
            .attr('href', '' + Moon)

        let encoderDisplay = new CyclicEncoderDisplay($svg.select('g.timeOfMonth-bits'), {
            resolution: 10,
            w: 5,
            n: 30,
            radius: earthRadius * 2.6,
            center: {
                x: width / 2, y: height / 2,
            },
            onColor: '#333',
            offColor: '#F5F3CE',
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
            let $gradient = $svg.select('#sunGradientTimeOfMonth')
            let distance = earthRadius * 35
            let sunRadius = distance * 1.2
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

        function renderCursor() {
            let $sun = $svg.select('circle.cursor')
            let $gradient = $svg.select('#cursorGradientTimeOfMonth')
            let cursorRadius = 20
            $sun.attr('cx', mouse[0])
                .attr('cy', mouse[1])
                .attr('r', cursorRadius)
            $gradient.attr('cx', mouse[0])
                .attr('cy', mouse[1])
                .attr('r', cursorRadius)
        }

        function renderMoon(theta) {
            let distance = earthRadius * 3.5
            let offset = - Math.PI / 2
            let x = (c.x - moonRadius) + distance * Math.sin(theta + offset)
            let y = (c.y - moonRadius) - distance * Math.cos(theta + offset)
            $moon.attr('x', x)
                .attr('y', y)
        }

        function onThetaUpdate() {
            let theta = jsds.get('theta')
            renderMoon(theta)
            if (mouse) renderCursor()
            let lazyAdjustment = 1.3
            let adjustedTheta = theta - lazyAdjustment
            if (adjustedTheta < 0) {
                adjustedTheta += 2*Math.PI
            }
            encoderDisplay.jsds.set('value', adjustedTheta)
        }

        jsds.after('set', 'theta', onThetaUpdate)

        $svg.on('mouseenter', () => {
            pauseAnimation()
            // $svg.select('circle.cursor').style('opacity', 1)
        })
        $svg.on('mouseleave', () => {
            // $svg.select('circle.cursor').style('opacity', 0)
            startAnimation()
        })
        $svg.on('mousemove', () => {
            mouse = d3.mouse($svg.node())
            let x = mouse[0] - c.x
            let y = mouse[1] - c.y
            let theta = Math.atan2(y, x) + radialOffset
            jsds.set('theta', theta)
        })

        renderSun(Math.PI/2)
        startAnimation()

    })

}

// It's a hack!
render.startAnimation = startAnimation
render.pauseAnimation = pauseAnimation
module.exports = render
