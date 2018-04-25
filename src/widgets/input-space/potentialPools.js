let SdrDrawing = require('SdrDrawing')
let utils = require('../utils')
let html = require('./potentialPools.tmpl.html')
let JSDS = require('JSDS')

function render(elementId) {

    let jsds = JSDS.create('spatial-pooling')

    utils.loadHtml(html.default, elementId, () => {

        let $receptiveFieldPercSlider = $('#receptiveFieldPercSlider')
        let $receptiveFieldPercDisplay = $('.receptiveFieldPercDisplay')
        let $inputSpaceSizeSlider = $('#inputSpaceSizeSlider')
        let $inputSpaceSizeDisplay = $('.inputSpaceSizeDisplay')
        let $miniColumnCountSlider = $('#miniColumnCountSlider')
        let $miniColumnCountDisplay = $('.miniColumnCountDisplay')

        let drawOptions = {
            width: 270,
            height: 270,
        }

        jsds.set('inputSpaceDimensions', parseInt($inputSpaceSizeSlider.val()))
        jsds.set('miniColumnCount', parseInt($miniColumnCountSlider.val()))
        jsds.set('receptiveFieldPerc', parseInt($receptiveFieldPercSlider.val()) / 100)

        function loadRandomPotentialPools() {
            let inputSpaceDimensions = parseInt($inputSpaceSizeSlider.val())
            let miniColumnCount = parseInt($miniColumnCountSlider.val())
            let receptiveFieldPerc = parseInt($receptiveFieldPercSlider.val()) / 100
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
            let miniColumnCount = parseInt($miniColumnCountSlider.val())
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
            $receptiveFieldPercDisplay.html($receptiveFieldPercSlider.val())
            $inputSpaceSizeDisplay.html($inputSpaceSizeSlider.val())
            $miniColumnCountDisplay.html($miniColumnCountSlider.val())
        }

        jsds.set('selectedMiniColumn', 0)
        jsds.after('set', 'selectedMiniColumn', updateDisplays)

        jsds.after('set', 'potentialPools', updateDisplays)

        loadRandomPotentialPools()

        $('#potentialPoolWidget input').on('input', (event) => {
            loadRandomPotentialPools()
            event.preventDefault()
            event.stopPropagation()
        })

    })

}

module.exports = render
