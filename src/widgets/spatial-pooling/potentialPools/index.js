let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')
let utils = require('../../utils')
let html = require('./template.html')

function render(elementId) {

    utils.loadHtml(html.default, elementId, () => {
        console.log("Running %s JS", elementId)

        let $receptiveFieldPercSlider = $('#receptiveFieldPercSlider')
        let $receptiveFieldPercDisplay = $('.receptiveFieldPercDisplay')
        let $inputSpaceSizeSlider = $('#inputSpaceSizeSlider')
        let $inputSpaceSizeDisplay = $('.inputSpaceSizeDisplay')
        let $miniColumnCountSlider = $('#miniColumnCountSlider')
        let $miniColumnCountDisplay = $('.miniColumnCountDisplay')

        let selectedMiniColumnIndex = 0
        let potentialPools = []
        let miniColumns = []

        let drawOptions = {
            width: 270,
            height: 270,
        }

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
            $(document).trigger(
                'potentialPoolUpdate',
                [potentialPools[selectedMiniColumnIndex], miniColumnCount]
            )
        }

        function updateSelectedMiniColumn(index) {
            selectedMiniColumnIndex = index
            let miniColumnCount = parseInt($miniColumnCountSlider.val())
            miniColumns = SdrUtils.getEmpty(miniColumnCount)
            miniColumns[selectedMiniColumnIndex] = 1
            $(document).trigger(
                'potentialPoolUpdate',
                [potentialPools[selectedMiniColumnIndex], miniColumnCount]
            )
        }

        function updateDisplays() {
            let pool = potentialPools[selectedMiniColumnIndex]
            let poolDrawing = new SdrDrawing(pool, 'inputSpacePools')
            poolDrawing.draw(drawOptions)

            let miniColumnsDrawing = new SdrDrawing(miniColumns, 'miniColumnPools')
            let mcOpts = Object.assign({}, drawOptions)
            mcOpts.onColor = 'khaki'
            miniColumnsDrawing.draw(mcOpts)
            miniColumnsDrawing.$drawing.attr('transform', 'translate(280)')
            miniColumnsDrawing.onCell('mouseover', (d, i) => {
                updateSelectedMiniColumn(i)
                updateDisplays()
            })

            $receptiveFieldPercDisplay.html($receptiveFieldPercSlider.val())
            $inputSpaceSizeDisplay.html($inputSpaceSizeSlider.val())
            $miniColumnCountDisplay.html($miniColumnCountSlider.val())
        }

        loadRandomPotentialPools()
        updateSelectedMiniColumn(0)
        updateDisplays()

        $('#potentialPoolWidget input').on('input', (event) => {
            updateSelectedMiniColumn(selectedMiniColumnIndex)
            loadRandomPotentialPools()
            updateDisplays()
            event.preventDefault()
            event.stopPropagation()
        })

        // This allows time for other widgets to load before sharing data.
        setTimeout(() => {
            let miniColumnCount = parseInt($miniColumnCountSlider.val())
            $(document).trigger(
                'potentialPoolUpdate',
                [potentialPools[selectedMiniColumnIndex], miniColumnCount]
            )
        }, 500)

    })

}

module.exports = render
