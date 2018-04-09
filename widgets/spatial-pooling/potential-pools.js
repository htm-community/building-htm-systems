let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')
let utils = require('../utils')

module.exports = () => {

    let miniColumnCount = 128
    let inputSpaceDimensions = 400
    let receptiveFieldPerc = 0.85
    let selectedMiniColumnIndex = 0
    let miniColumns = SdrUtils.getEmpty(miniColumnCount)
    let potentialPools = []

    let drawOptions = {
        width: 270,
        height: 310,
        cellSize: 13,
        rowLength: 20,
    }

    function loadRandomPotentialPools() {
        potentialPools = []
        for (let i = 0; i < miniColumnCount; i++) {
            let pool = utils.getRandomReceptiveField(
                receptiveFieldPerc,
                inputSpaceDimensions
            )
            potentialPools.push(pool)
        }
    }

    function updateDisplays() {
        let pool = potentialPools[selectedMiniColumnIndex]
        let poolDrawing = new SdrDrawing(pool, 'inputSpacePools')
        poolDrawing.draw(drawOptions)
        let miniColumnsDrawing = new SdrDrawing(miniColumns, 'miniColumnPools')
        let mcDrawingOptions = Object.assign(drawOptions, {
            cellSize: 21,
            rowLength: 12,
        })
        miniColumnsDrawing.draw(drawOptions)
    }

    loadRandomPotentialPools()
    updateDisplays()

}
