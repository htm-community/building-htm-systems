let utils = require('../../widgets/utils')
let html = require('./oneGridCell.tmpl.html')
let HexagonGridCellModule = require('HexagonGridCellModule')
let JSDS = require('JSDS')

let jsds = JSDS.create('oneGridCell')

let startingParams = {
    anchor: {x: 0, y: 0},
    scale: 20,
    orientation: 15.0,
}

let walkDistance = 10000
let walkSpeed = 2.0
let walkFunction
let wasWalking = false
jsds.set('walks', wasWalking)
let mouseover = false
let frameRef = -1

let colors = {
    fields: {
        on: {
            fill: 'CORNFLOWERBLUE',
        },
        dim: {
            fill: '#CBF1F1',
        },
        stroke: 'LIGHTSTEELBLUE',
        fill: 'none',
    }
}

let moduleOut = (elId) => {
    utils.loadHtml(html.default, elId, () => {

        let $walksCheckbox = $('#' + elId + ' input.walks')

        let width = 450
        let height = 250

        let t = 0
        let [X,V] = utils.randomTorusWalk(
            walkDistance, width, height, walkSpeed
        )
        walkFunction = X

        let $svg = d3.select('#' + elId + ' svg')
            .attr('width', width)
            .attr('height', height)

        let $el = $('#' + elId)
        let $orientationSlider = $el.find('input.orientation'),
            $scaleSlider = $el.find('input.scale')

        function treatFields(fields, color, params) {
            fields.attr('class', 'field')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', params.scale / 2)
                .attr('stroke', colors.fields.stroke)
                .attr('fill', d => {
                    let fill = colors.fields.fill
                    if (d.gridCell.id === 0) {
                        fill = colors.fields.dim.fill
                        if (d.gridCell.active) fill = colors.fields.on.fill
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

        // Random walk animation controls
        function start() {
            if (! mouseover) {
                frameRef = window.requestAnimationFrame(step)
            }
        }

        function stop() {
            window.cancelAnimationFrame(frameRef)
        }

        function step() {
            if (isNaN(t) || t === undefined) {
                t = 0
            }
            let x = X[t%walkDistance][0];
            let y = X[t%walkDistance][1];
            jsds.set('location', {
                type: 'world',
                x: x, y: y
            })
            t++
            if (jsds.get('walks')) {
                start()
            }
        }

        // Animation events
        $walksCheckbox.change((evt) => {
            let walks = document.getElementById(evt.target.id).checked
            jsds.set('walks', walks)
        })

        let interactEnter = () => {
            d3.event.preventDefault()
            mouseover = true
            if (jsds.get('walks')) stop()
        }
        let interactMove = () => {
            d3.event.preventDefault()
            let mouse = d3.mouse($svg.node())
            jsds.set('location', {x: mouse[0], y: mouse[1]})
        }
        let interactLeave = () => {
            d3.event.preventDefault()
            mouseover = false
            if (jsds.get('walks')) start()
        }

        $svg.on('mouseenter', interactEnter)
        $svg.on('mousemove', interactMove)
        $svg.on('mouseleave', interactLeave)
        $svg.on('touchstart', interactEnter)
        $svg.on('touchmove', interactMove)
        $svg.on('touchend', interactLeave)

        jsds.before('set', 'walks', () => {
            // stash previous value
            wasWalking = jsds.get('walks')
        })
        jsds.after('set', 'walks', (walks) => {
            $walksCheckbox.prop('checked', walks)
            if (walks && ! wasWalking) {
                start()
            } else if (! walks && wasWalking) {
                stop()
            }
        })

        // This is the input from the user. Values change and the display updates.
        $('#' + elId + ' input').on('input', () => {
            let params = jsds.get('params')
            params.orientation = parseInt($orientationSlider.val())
            params.scale = parseInt($scaleSlider.val())
            jsds.set('params', params)
        })

        jsds.after('set', 'params', updateDisplay)
        jsds.after('set', 'location', updateDisplay)

        // The listeners will render.
        jsds.set('params', startingParams)
        jsds.set('location', {x: width/2, y: height/2, type:'world'})
    })
}

module.exports = moduleOut
