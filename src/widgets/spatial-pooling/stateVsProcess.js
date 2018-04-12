let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')

// function getRandomPotentialPools(inputSpaceDimensions,
//                                  miniColumnCount,
//                                  receptiveFieldPerc) {
//     let potentialPools = []
//     for (let i = 0; i < miniColumnCount; i++) {
//         let pool = []
//         for (let j = 0; j < inputSpaceDimensions; j++) {
//             if (Math.random() > receptiveFieldPerc) pool.push(0)
//             else pool.push(1)
//         }
//         // Compress into indices
//         potentialPools.push(SdrUtils.getActiveBits(pool))
//     }
//     return potentialPools
// }
//
// function getNormalPermanenceDistribution(independentVariables, distributionCenter, potentialPool) {
//     let permanences = {}
//     d3.range(potentialPool.length)
//         .map(d3.randomBates(independentVariables))
//         .forEach((val, i) => {
//             permanences[potentialPool[i]] = val
//         })
//     return permanences
// }
//
// module.exports = () => {
//
//     let miniColumnCount = 128
//     let inputSpaceSize = 400
//     let receptiveFieldPerc = 0.5
//     let independentVariables = 30
//     let connectionThreshold = 0.2
//     let distributionCenter = connectionThreshold
//
//     function buildCells() {
//         let miniColumns = []
//         let pools = getRandomPotentialPools(
//             miniColumnCount, inputSpaceSize, receptiveFieldPerc
//         )
//         for (let i = 0; i < miniColumnCount; i++) {
//             miniColumns.push(getNormalPermanenceDistribution(
//                 independentVariables, distributionCenter, pools[i]
//             ))
//         }
//     }
//
//     buildCells()
// }
