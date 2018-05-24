let utils = require('../../widgets/utils')
let html = require('./oneGridCellModule.tmpl.html')
let HexagonGridCellModule = require('HexagonGridCellModule')
let JSDS = require('JSDS')

let jsds = JSDS.create('oneGridCellModule')

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

        let width = 443
        let height = 250

        let t = 0
        let [X,V] = utils.randomTorusWalk(
            walkDistance, width, height, walkSpeed
        )
        walkFunction = X

        let overlaySize = 140

        let $svg = d3.select('#' + elId + ' svg.main')
            .attr('width', width)
            .attr('height', height)
        let $world = $svg.select('g.world')
        let $overlay = $svg.select('svg.overlay')

        let $el = $('#' + elId)
        let $orientationSlider = $el.find('input.orientation'),
            $scaleSlider = $el.find('input.scale')

        function setUpOverlay() {
            let overlayPadding = 10,
                overlayX = overlayPadding,
                overlayY = height - overlayPadding - overlaySize

            $overlay
                .attr('x', overlayX).attr('y', overlayY)
                .attr('width', overlaySize).attr('height', overlaySize)
            $overlay.select('rect')
                .attr('stroke', 'black')
                .attr('stroke-width', '2px')
                .attr('fill', 'white')
                .attr('width', overlaySize).attr('height', overlaySize)
        }

        function treatFields(fields, params) {
            fields.attr('class', 'field')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', params.scale / 2)
                .attr('stroke', colors.fields.stroke)
                .attr('fill', d => {
                    let fill = colors.fields.fill
                    if (d.gridCell.active) fill = colors.fields.on.fill
                    return fill
                })
        }

        function updateFields($group, points, module, params) {
            // Update
            let $fields = $group.selectAll('circle.field').data(points)
            treatFields($fields, params)

            // Enter
            let $newFields = $fields.enter().append('circle')
            treatFields($newFields, params)

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
        }

        function updateDisplay() {
            let params = jsds.get('params')
            let location = jsds.get('location')
            // Bail out if params or location haven't been loaded yet.
            if (! params || ! location) return;

            let module = new HexagonGridCellModule(
                0, 4, 4, params.orientation, params.scale
            )
            module.setColor(100, 100, 255)
            module.activeCells = 1

            let origin = {x: 0, y: 0}

            let worldPoints = module.createWorldPoints(origin, width, height)
            origin.y = 80
            let overlayPoints = module.createOverlayPoints(origin)
            if (location.type === 'world') {
                module.intersectWorld(location.x, location.y, worldPoints)
            } else if (location.type === 'overlay') {
                module.intersectOverlay(location.x, location.y, overlayPoints)
            } else throw new Error("Unknown location type")

            updateFields($world, worldPoints, module, params)
            updateFields($overlay, overlayPoints, module, params)
            if (location.type === 'world')
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
            let worldMouse = d3.mouse($world.node()),
                overlayMouse = d3.mouse($overlay.node())
            ox = overlayMouse[0], oy = overlayMouse[1]
            let location = {
                type: 'world',
                x: worldMouse[0],
                y: worldMouse[1],
            }
            if (0 < ox && ox < overlaySize
                && 0 < oy && oy < overlaySize) {
                location.type = 'overlay'
                location.x = overlayMouse[0]
                location.y = overlayMouse[1]
            }
            jsds.set('location', location)
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

        // Start here
        setUpOverlay()

        // This is the input from the user. Values change and the display updates.
        $('#' + elId + ' input').on('input', () => {
            let params = jsds.get('params')
            params.orientation = parseInt($orientationSlider.val())
            params.scale = parseInt($scaleSlider.val())
            jsds.set('params', params)
        })

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

        // Update when values change.
        jsds.after('set', 'params', updateDisplay)
        jsds.after('set', 'location', updateDisplay)

        jsds.set('params', startingParams)

        start()
    })
}

module.exports = moduleOut
