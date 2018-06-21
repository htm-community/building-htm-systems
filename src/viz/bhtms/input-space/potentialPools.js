let SdrDrawing = require('SdrDrawing')
let dat = require('dat.gui')
let utils = require('../../../lib/utils')
let html = require('./potentialPools.tmpl.html')
let JSDS = require('JSDS')

function render(elementId) {

    let jsds = JSDS.create('spatial-pooling')

    let uiValues = {
        'input bits': 300,
        'receptive field': 0.9,
        'mini-columns': 300,
    }

    function setupDatGui($el, onChange) {
        let gui = new dat.GUI({
            autoPlace: false,
        })
        gui.add(uiValues, 'input bits', 50, 500, 1).listen().onChange((v) => {
            uiValues['input bits'] = v
            jsds.set('input bits', uiValues['input bits'])
            onChange()
        })
        gui.add(uiValues, 'receptive field', 0, 1, .01).listen().onChange((v) => {
            uiValues['receptive field'] = v
            jsds.set('receptive field', uiValues['receptive field'])
            onChange()
        })
        gui.add(uiValues, 'mini-columns', 50, 1000, 1).listen().onChange((v) => {
            uiValues['mini-columns'] = v
            jsds.set('mini-columns', uiValues['mini-columns'])
            onChange()
        })
        $el.append(gui.domElement)
    }

    utils.loadHtml(html.default, elementId, () => {
        let $jqEl = $('#' + elementId)
        let $datGui = $jqEl.find('.dat-gui')

        let drawOptions = {
            width: 270,
            height: 270,
        }

        jsds.set('input bits', uiValues['input bits'])
        jsds.set('mini-columns', uiValues['mini-columns'])
        jsds.set('receptive field', uiValues['receptive field'])

        function loadRandomPotentialPools() {
            let inputSpaceDimensions = uiValues['input bits']
            let miniColumnCount = uiValues['mini-columns']
            let receptiveFieldPerc = uiValues['receptive field']
            potentialPools = []
            for (let i = 0; i < miniColumnCount; i++) {
                let pool = []
                for (let j = 0; j < inputSpaceDimensions; j++) {
                    if (Math.random() > receptiveFieldPerc) pool.push(0)
                    else pool.push(1)
                }
                potentialPools.push(pool)
            }
            let selectedMiniColumn = jsds.get('selectedMiniColumn')
            if (selectedMiniColumn >= potentialPools.length) {
                jsds.set('selectedMiniColumn', potentialPools.length - 1)
            }
            jsds.set('potentialPools', potentialPools)
        }

        function updateSelectedMiniColumn(index) {
            jsds.set('selectedMiniColumn', index)
        }

        function updateDisplays() {
            let selectedMiniColumn = jsds.get('selectedMiniColumn')
            let miniColumnCount = jsds.get('mini-columns')
            let miniColumnPools = new Array(miniColumnCount)
            miniColumnPools[selectedMiniColumn] = 1
            let miniColumnsDrawing = new SdrDrawing(
                miniColumnPools, 'miniColumnPools'
            )
            let mcOpts = Object.assign({}, drawOptions)
            mcOpts.onColor = 'khaki'
            miniColumnsDrawing.draw(mcOpts)
            miniColumnsDrawing.$drawing.attr('transform', 'translate(280)')
            miniColumnsDrawing.onCell('mouseover', (d, i) => {
                jsds.set('selectedMiniColumn', i)
            })

            let pool = jsds.get('potentialPools')[selectedMiniColumn]
            let poolDrawing = new SdrDrawing(pool, 'inputSpacePools')
            poolDrawing.draw(drawOptions)
        }

        jsds.set('selectedMiniColumn', 0)
        jsds.after('set', 'selectedMiniColumn', updateDisplays)
        jsds.after('set', 'potentialPools', updateDisplays)

        setupDatGui($datGui, loadRandomPotentialPools)
        loadRandomPotentialPools()

    })

}

module.exports = render
