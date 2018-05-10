let utils = require('../../widgets/utils')
let html = require('./manyGridCellModules.tmpl.html')
let HexagonGridCellModule = require('HexagonGridCellModule')
let JSDS = require('JSDS')

let jsds = JSDS.create('manyGridCellModules')

let startingParams = {
    anchor: {x: 0, y: 0}
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
        stroke: 'none',
        fill: 'none',
    }
}

let gridCellModules

function buildGridCellModules(numModules) {
    let out = []
    while (out.length < numModules) {
        let orientation = parseInt(utils.getRandomArbitrary(0, 60))
        let scale = parseInt(utils.getRandomArbitrary(10, 50))
        let module = new HexagonGridCellModule(
            0, 4, 4, orientation, scale
        )
        module.setColor(
            utils.getRandomArbitrary(100, 255),
            utils.getRandomArbitrary(100, 255),
            utils.getRandomArbitrary(100, 255)
        )
        module.activeCells = 1
        out.push(module)
    }
    return out
}

let moduleOut = (elId, numModules = 16) => {
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
        gridCellModules = buildGridCellModules(numModules)

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
                .attr('r', params.scale / 4)
                .attr('stroke', colors.fields.stroke)
                .attr('fill', (d) => {
                    let fill = colors.fields.fill
                    let gridCellIndex = d.gridCell.id
                    if (d.gridCell.active)
                        fill = gridCellModules[gridCellIndex].getColorString()
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

        function updateLocation($group, location) {
            let w = 12
            $group.select('rect.location')
                .attr('x', location.x - w/2)
                .attr('y', location.y - w/2)
                .attr('width', w)
                .attr('height', w)
                .attr('rx', w/4).attr('ry', w/4)
                .attr('fill', 'white')
                .attr('stroke', 'black')
                .attr('stroke-width', '3px')
        }

        function updateWorld($world, location, params) {
            let data = d3.range(0, numModules)

            function treatGroups(groups) {
                groups
                    .attr('class', (d, i) => {
                        return 'gcm gcm-' + i
                    })
            }

            // Update
            let $gcmWorldGroups = $world.selectAll('g.gcm').data(data)
            treatGroups($gcmWorldGroups)

            // Enter
            let $newGroups = $gcmWorldGroups.enter().append('g')
            treatGroups($newGroups)

            // Exit
            $gcmWorldGroups.exit().remove()

            $gcmWorldGroups.each((value, index) => {
                let $group = d3.select('.gcm-' + index)
                let module = gridCellModules[index]
                let origin = {x: 0, y: 0}
                let worldPoints = module.createWorldPoints(origin, width, height)
                if (location.type === 'world')
                    module.intersectWorld(location.x, location.y, worldPoints)
                let myParams = Object.assign({
                    scale: module.scale,
                }, params)
                updateFields($group, worldPoints, module, myParams)
            })
        }

        function updateDisplay() {
            let params = jsds.get('params')
            let location = jsds.get('location')
            // Bail out if params or location haven't been loaded yet.
            if (! params || ! location) return;

            let $world = $svg.selectAll('g.world').data([null])
            let $overlay = $svg.selectAll('g.overlay').data([null])
            $world.enter().append('g').attr('class', 'world')
            $overlay.enter().append('g').attr('class', 'overlay')

            updateWorld($world, location, params)
            // updateOverlay($overlay, location, params)

            updateLocation($svg, location)
            // update display sliders
            $orientationSlider.val(params.orientation)
            $scaleSlider.val(params.scale)
        }

        function updateParams() {
            gridCellModules = buildGridCellModules(numModules)
            updateDisplay()
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

        $svg.on('mouseenter', () => {
            mouseover = true
            if (jsds.get('walks')) stop()
        })
        $svg.on('mouseleave', () => {
            mouseover = false
            if (jsds.get('walks')) start()
        })

        // Start here
        // setUpOverlay()

        // On user mouse move over world.
        $svg.on('mousemove', () => {
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
        jsds.after('set', 'hide-marker', (hide) => {
            let visible = 'visible'
            if (hide) visible = 'hidden'
            $svg.select('rect.location').attr('visibility', visible)
        })

        // Update when values change.
        jsds.after('set', 'params', updateParams)
        jsds.after('set', 'location', updateDisplay)

        jsds.set('params', startingParams)

        start()
    })
}

module.exports = moduleOut
