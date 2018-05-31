let utils = require('../../widgets/utils')
let html = require('./manyGridCellModules.tmpl.html')
let HexagonGridCellModule = require('HexagonGridCellModule')
let JSDS = require('JSDS')

let jsds = JSDS.create('manyGridCellModules')

let startingParams = {
    anchor: {x: 0, y: 0},
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
let gridRows = 4, gridCols = 4

function buildGridCellModules(gcmCount) {
    let out = []
    while (out.length < gcmCount) {
        let orientation = parseInt(utils.getRandomArbitrary(0, 60))
        let scale = parseInt(utils.getRandomArbitrary(10, 50))
        let module = new HexagonGridCellModule(
            0, gridRows, gridCols, orientation, scale
        )
        module.setColor(
            Math.round(utils.getRandomArbitrary(100, 255)),
            Math.round(utils.getRandomArbitrary(100, 255)),
            Math.round(utils.getRandomArbitrary(100, 255))
        )
        module.activeCells = 1
        out.push(module)
    }
    return out
}

let moduleOut = (elId, gcmCount = 16) => {
    utils.loadHtml(html.default, elId, () => {

        let $walksCheckbox = $('#' + elId + ' input.walks')

        let width = 443
        let height = 250
        let t = 0
        let [X,V] = utils.randomTorusWalk(
            walkDistance, width, height, walkSpeed
        )
        walkFunction = X

        // I'm just stashing there here because it is convenient, not because it
        // is the right thing to do.
        startingParams.gcmCount = gcmCount

        gridCellModules = buildGridCellModules(gcmCount)

        let $svg = d3.select('#' + elId + ' svg.main')
            .attr('width', width)
            .attr('height', height)
        let $world = $svg.select('g.world')

        let $el = $('#' + elId)
        let $orientationSlider = $el.find('input.orientation'),
            $scaleSlider = $el.find('input.scale'),
            $gcmCountSlider = $el.find('input.gcmCount'),
            $gcmCountDisplay = $('span.gcmCount'),
            $cellCountDisplay = $('span.cellCount')

        function treatFields(fields, gcmIndex, params) {
            fields.attr('class', 'field')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', params.scale / 4)
                .attr('stroke', colors.fields.stroke)
                .attr('fill', (d) => {
                    let fill = colors.fields.fill
                    let gridCellIndex = d.gridCell.id
                    if (d.gridCell.active)
                        fill = gridCellModules[gcmIndex].getColorString()
                    return fill
                })
        }

        function updateFields($group, points, gcmIndex, params) {
            // Update
            let $fields = $group.selectAll('circle.field').data(points)
            treatFields($fields, gcmIndex, params)

            // Enter
            let $newFields = $fields.enter().append('circle')
            treatFields($newFields, gcmIndex, params)

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
            let data = d3.range(0, params.gcmCount)

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
                let $group = $svg.select('.gcm-' + index)
                let module = gridCellModules[index]
                let origin = {x: 0, y: 0}
                let worldPoints = module.createWorldPoints(origin, width, height)
                if (location.type === 'world')
                    module.intersectWorld(location.x, location.y, worldPoints)
                let myParams = Object.assign({
                    scale: module.scale,
                }, params)
                updateFields($group, worldPoints, index, myParams)
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
            $gcmCountSlider.val(params.gcmCount)
            $gcmCountDisplay.html(params.gcmCount)
            $cellCountDisplay.html(params.gcmCount * gridRows * gridCols)
        }

        function updateParams() {
            gridCellModules = buildGridCellModules(jsds.get('params').gcmCount)
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

        let interactEnter = () => {
            d3.event.preventDefault()
            mouseover = true
            if (jsds.get('walks')) stop()
        }
        let interactMove = () => {
            d3.event.preventDefault()
            let worldMouse = d3.mouse($world.node())
            let location = {
                type: 'world',
                x: worldMouse[0],
                y: worldMouse[1],
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

        // User slider events
        $gcmCountSlider.on('input', () => {
            let params = jsds.get('params')
            params.gcmCount = parseInt($gcmCountSlider.val())
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
