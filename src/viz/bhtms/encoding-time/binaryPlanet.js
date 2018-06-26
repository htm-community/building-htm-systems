let JSDS = require('JSDS')
let utils = require('../../../lib/utils')
let html = require('./binaryPlanet.tmpl.html')

function render(elementId) {

    utils.loadHtml(html.default, elementId, () => {
        let width = 560
        let height = 400
        let jsds = JSDS.create('binaryPlanet-' + elementId)


        let $svg = d3.select('#' + elementId + ' svg')
            .attr('width', width)
            .attr('height', height)

        // Static components are rendered once

        // render planet
        let $planet = $svg.select('g.planet')
        let buffer = 90
        let radius = 110
        let c = {
            x: buffer + radius,
            y: buffer + radius,
            r: radius,
        }
        let planetSize = radius * 2
        $planet.select('image')
            .attr('x', c.x - radius)
            .attr('y', c.y - radius)
            .attr('height', planetSize)
            .attr('width', planetSize)

        // TODO: Render the stick person

        // TODO: Render the button


        // Dynamic components depend on the value of theta
        // render ray given theta

        function renderRay(theta) {
            let d1 = radius * 4
            let d2 = radius + buffer/2

            function getPoint(dist) {
                return {
                    x: c.x + dist * Math.sin(theta),
                    y: c.y - dist * Math.cos(theta),
                }
            }

            let p1 = getPoint(d1)
            let p2 = getPoint(d2)

            let $line = $planet.select('line')
            $line.attr('stroke', 'white')
                .attr('stroke-width', '3px')
                .attr('x1', p1.x)
                .attr('y1', p1.y)
                .attr('x2', p2.x)
                .attr('y2', p2.y)

            // TODO: Make this line into an arrow

        }

        function renderSun(theta) {
            let $sun = $planet.select('circle.sun')
            let $gradient = $planet.select('defs radialGradient')
            let distance = radius * 12
            let sunRadius = distance * 1.15
            let x = c.x + distance * Math.sin(theta)
            let y = c.y - distance * Math.cos(theta)
            $sun.attr('cx', x)
                .attr('cy', y)
                .attr('r', sunRadius)
            $gradient.attr('cx', x)
                .attr('cy', y)
                .attr('r', sunRadius)
        }

        function throwShade(theta) {
            let $shade = $planet.select('path.shade')

            let arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius)
                .startAngle(theta + Math.PI * 1/2)
                .endAngle(theta + Math.PI * 9/6)

            $shade.attr('d', arc())
                .attr('opacity', 0.5)
                .attr('transform', 'translate(' + c.x + ', ' + c.y + ')')
        }

        function onThetaUpdate() {
            let theta = jsds.get('theta')
            // renderRay(theta)
            renderSun(theta)
            throwShade(theta)
        }

        jsds.after('set', 'theta', onThetaUpdate)


        let $output = $svg.select('g.output')

        $svg.on('mousemove', () => {
            let mouse = d3.mouse($svg.node())
            let x = mouse[0] - c.x
            let y = mouse[1] - c.y
            let theta = Math.atan2(y, x) + Math.PI / 2
            jsds.set('theta', theta)
        })

        // Kick everything off by setting theta to 30 degrees
        jsds.set('theta', Math.PI * 2 / 12)

    })

}

module.exports = render
