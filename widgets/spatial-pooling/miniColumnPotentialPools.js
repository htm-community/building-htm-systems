let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')

module.exports = () => {

    var store = JSDS.create('spatial-pooling')
    store.set('miniColumnCount', 128)

    let $receptiveFieldPercSlider = $('#receptiveFieldPercSlider')
    let $receptiveFieldPercDisplay = $('.receptiveFieldPercDisplay')
    let $inputSpaceSizeSlider = $('#inputSpaceSizeSlider')
    let $inputSpaceSizeDisplay = $('.inputSpaceSizeDisplay')
    let $miniColumnCountSlider = $('#miniColumnCountSlider')
    let $miniColumnCountDisplay = $('.miniColumnCountDisplay')

    let miniColumns = []

    let drawOptions = {
        width: 270,
        height: 270,
    }

    function loadRandomPotentialPools() {
        let inputSpaceDimensions = parseInt($inputSpaceSizeSlider.val())
        let miniColumnCount = parseInt($miniColumnCountSlider.val())
        for (let i = 0; i < miniColumnCount; i++) {
            let pool = []
            let receptiveFieldPerc = parseInt($receptiveFieldPercSlider.val()) / 100
            for (let j = 0; j < inputSpaceDimensions; j++) {
                if (Math.random() > receptiveFieldPerc) pool.push(0)
                else pool.push(1)
            }
            store.set('potentialPools.' + i, pool)
        }
    }

    function updateSelectedMiniColumn(index) {
        let selectedMiniColumn = index
        let miniColumnCount = parseInt($miniColumnCountSlider.val())
        miniColumns = SdrUtils.getEmpty(miniColumnCount)
        miniColumns[selectedMiniColumn] = 1
        store.set('selectedMiniColumn', selectedMiniColumn)
    }

    function updateDisplays() {
        let selectedMiniColumn = store.get('selectedMiniColumn')
        let pool = store.get('potentialPools.' + selectedMiniColumn)
        let poolDrawing = new SdrDrawing(pool, 'inputSpacePools')
        poolDrawing.draw(drawOptions)

        let miniColumnsDrawing = new SdrDrawing(miniColumns, 'miniColumnPools')
        let mcOpts = Object.assign({}, drawOptions)
        mcOpts.onColor = 'khaki'
        miniColumnsDrawing.draw(mcOpts)
        miniColumnsDrawing.$drawing.attr('transform', 'translate(280)')
        miniColumnsDrawing.onCell('mouseover', (d, i) => {
            updateSelectedMiniColumn(i)
        })

        $receptiveFieldPercDisplay.html($receptiveFieldPercSlider.val())
        $inputSpaceSizeDisplay.html($inputSpaceSizeSlider.val())
        $miniColumnCountDisplay.html($miniColumnCountSlider.val())
    }

    store.after('set', 'selectedMiniColumn', updateDisplays)

    loadRandomPotentialPools()
    store.set('selectedMiniColumn', 0)

    // updateSelectedMiniColumn(0)
    // updateDisplays()
    //
    // $('#potentialPoolWidget input').on('input', (event) => {
    //     updateSelectedMiniColumn(selectedMiniColumnIndex)
    //     loadRandomPotentialPools()
    //     updateDisplays()
    //     event.preventDefault()
    //     event.stopPropagation()
    // })

    // // This allows time for other widgets to load before sharing data.
    // setTimeout(() => {
    //     let miniColumnCount = parseInt($miniColumnCountSlider.val())
    //     $(document).trigger(
    //         'potentialPoolUpdate',
    //         [potentialPools[selectedMiniColumnIndex], miniColumnCount]
    //     )
    // }, 500)

}
