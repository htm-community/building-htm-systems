let utils = require('../../widgets/utils')
let html = require('./oneGridCell.tmpl.html')
let HexagonGridCellModule = require('HexagonGridCellModule')
let JSDS = require('JSDS')

let jsds = JSDS.create('oneGridCell')

let startingParams = {
    anchor: {x: 0, y: 0},
    scale: 30,
    orientation: 15.0,
}

let moduleOut = (elId) => {
    utils.loadHtml(html.default, elId, () => {

        let width = 443
        let height = 250

        let $svg = d3.select('#' + elId + ' svg')
            .attr('width', width)
            .attr('height', height)

        let $orientationSlider = $('#orientation')
            $scaleSlider = $('#scale')

        function treatFields(fields, color, params) {
            fields.attr('class', 'field')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', params.scale / 2)
                .attr('stroke', 'LIGHTSTEELBLUE')
                .attr('fill', d => {
                    let fill = 'none'
                    if (d.gridCell.id === 0) {
                        fill = 'LIGHTSTEELBLUE'
                        if (d.gridCell.active) fill = 'CORNFLOWERBLUE'
                    }
                    return fill
                })
        }

        function updateFields($world, points, module, params) {
            // Update
            let $fields = $world.selectAll('circle.field').data(points)
            treatFields($fields, module.getColorString(), params)

            // Enter
            let $newFields = $fields.enter().append('circle')
            treatFields($newFields, module.getColorString(), params)

            // Exit
            $fields.exit().remove()
        }

        function updateLocation($group, location, params) {
            let w = params.scale / 3
            $group.select('rect.location')
                .attr('x', location.x - w/2)
                .attr('y', location.y - w/2)
                .attr('width', w)
                .attr('height', w)
                .attr('rx', w/4).attr('ry', w/4)
                .attr('fill', 'LIGHTCORAL')
                .attr('stroke', 'INDIANRED')
                .attr('stroke-width', '2px')
        }

        function updateDisplay() {
            let params = jsds.get('params')
            let location = jsds.get('location')
            // Bail out if params or location haven't been loaded yet.
            if (! params || ! location) return;

            let $world = $svg.select('g.world')

            let module = new HexagonGridCellModule(
                0, 4, 4, params.orientation, params.scale
            )
            module.setColor(100, 100, 255)
            module.activeCells = 1

            let origin = {x: 0, y: 0}
            let points = module.createWorldPoints(origin, width, height)
            module.intersectWorld(location.x, location.y, points)

            updateFields($world, points, module, params)
            updateLocation($svg, location, params)

            // update display sliders
            $orientationSlider.val(params.orientation)
            $scaleSlider.val(params.scale)
        }

        // This is the input from the user. Values change and the display updates.
        $('#' + elId + ' input').on('input', () => {
            let params = jsds.get('params')
            params.orientation = parseInt($orientationSlider.val())
            params.scale = parseInt($scaleSlider.val())
            jsds.set('params', params)
        })

        // On mouseover the bar, decide whether to fire.
        $svg.on('mousemove', () => {
            let mouse = d3.mouse($svg.node())
            jsds.set('location', {x: mouse[0], y: mouse[1]})
        })

        jsds.after('set', 'params', updateDisplay)
        jsds.after('set', 'location', updateDisplay)

        // This is what actually kicks off the program
        jsds.set('params', startingParams)
        jsds.set('location', {x: 100, y: 100})
    })
}

module.exports = moduleOut
