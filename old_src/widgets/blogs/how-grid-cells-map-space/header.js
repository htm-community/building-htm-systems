let utils = require('../../../lib/utils')
let html = require('./header.tmpl.html')
let HexagonGridCellModule = require('HexagonGridCellModule')
let JSDS = require('JSDS')

let jsds = JSDS.create('header')

let startingParams = {
    anchor: {x: 0, y: 0},
}

let walkDistance = 10000
let walkSpeed = 2.0
let walkFunction
let wasWalking = true
jsds.set('walks', wasWalking)
let frameRef = -1

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
            utils.getRandomArbitrary(100, 255),
            utils.getRandomArbitrary(100, 255),
            utils.getRandomArbitrary(100, 255)
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
        let height = 60
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

        function treatFields(fields, gcmIndex, params) {
            fields.attr('class', 'field')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
                .attr('r', params.scale / 4)
                .attr('stroke', 'none')
                .attr('fill', (d) => {
                    let fill = 'none'
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
        }

        function updateParams() {
            gridCellModules = buildGridCellModules(jsds.get('params').gcmCount)
            updateDisplay()
        }

        // On user mouse move over world.
        $svg.on('mousemove', () => {
            d3.event.preventDefault()
            let worldMouse = d3.mouse($world.node())
            let location = {
                type: 'world',
                x: worldMouse[0],
                y: worldMouse[1],
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

        function setRandomLocation() {
            jsds.set('location', {
                x: utils.getRandomArbitrary(0, 300),
                y: 30,
                type: 'world'
            })
        }

        setRandomLocation()
        let initialLoop = setInterval(setRandomLocation, 1000)
        setTimeout(() => {
            clearInterval(initialLoop)
        }, 10000)
    })
}

module.exports = moduleOut
