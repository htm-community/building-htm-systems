window.BHTMS = {
    header: require('./header'),
    gridCellFiringFields: require('./firingFields'),
    oneGridCell: require('./oneGridCell'),
    oneGridCellModule: require('./oneGridCellModule'),
    manyGridCellModules: require('./manyGridCellModules'),
    gcmAsSdr: require('./gcmAsSdr'),
    JSDS: require('JSDS'),
}

// Kicks things off.
document.addEventListener("DOMContentLoaded", () => {
    require('./embed')()
})
