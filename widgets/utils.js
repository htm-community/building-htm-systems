let SdrUtils = require('SdrUtils')

function getRandomReceptiveField(receptiveFieldPerc, dimensions) {
    let n = dimensions
    let w = parseInt(receptiveFieldPerc * n)
    let potentialPool = SdrUtils.getRandom(n, w)
    return potentialPool
}

module.exports = {
    getRandomReceptiveField: getRandomReceptiveField
}
