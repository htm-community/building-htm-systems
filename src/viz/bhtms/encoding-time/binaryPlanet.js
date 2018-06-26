let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./binaryPlanet.tmpl.html')
let SdrDrawing = require('SdrDrawing')
let Stickman = require('./img/stickman.png')
let Planet = require('./img/planet.png')

function render(elementId) {

    utils.loadHtml(html.default, elementId, () => {

        const radialOffset = Math.PI / 2
        const width = 560
        const height = 400

        const n = 440

        let jsds = JSDS.create('binaryPlanet-' + elementId)

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
            .attr('href', '../../../../docs/' + Planet)
        // TODO: ^^ I know I'm not doing this right

        let $stickman = $svg.select('image.stickman')
        let manWidth = 20
        let manHeight = 50
        $stickman
            .attr('width', manWidth)
            .attr('height', manHeight)
            .attr('x', c.x - manWidth/2)
            .attr('y', c.y - radius - manHeight + 10)
            .attr('href', '../../../../docs/' + Stickman)
        // TODO: ^^ I know I'm not doing this right

        // TODO: Render the button


        // Dynamic components depend on the value of theta
        // render ray given theta

        function renderSun(theta) {
            let $sun = $svg.select('circle.sun')
            let $gradient = $svg.select('#sunGradient')
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
            let $gradient = $svg.select('#cursorGradient')
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
            let out = new Array(n).fill(0)
            let min = Math.PI / 2
            let max = Math.PI * 9/6
            let mid = (max - min) / 2
            let start = 0, end = n
            if (value < mid) end = parseInt(n/2)
            else start = parseInt(n/2)
            d3.range(start, end).forEach(i => {
                out[i] = 1
            })
            return out
        }

        function onThetaUpdate() {
            let theta = jsds.get('theta')
            renderSun(theta)
            throwShade(theta)
            if (mouse) renderCursor()
            let encoding = encode(theta)
            jsds.set('encoding', encoding)
        }

        jsds.after('set', 'theta', onThetaUpdate)
        jsds.after('set', 'encoding', renderEncoding)

        $svg.on('mousemove', () => {
            mouse = d3.mouse($svg.node())
            let x = mouse[0] - c.x
            let y = mouse[1] - c.y
            let theta = Math.atan2(y, x) + radialOffset
            jsds.set('theta', theta)
        })

        // Kick everything off by setting theta to 30 degrees
        jsds.set('theta', Math.PI * 2 / 12)

    })

}

module.exports = render
