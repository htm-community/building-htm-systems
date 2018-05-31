module.exports = () => {
    let cuts = 20,
        current = 0,
        speed = 50

    function animateParamChange(jsds, target) {
        let params = jsds.get('params')
        let keys = Object.keys(target)
        let scales = {}
        keys.forEach(function(key) {
            scales[key] = d3.scaleLinear()
                .domain([0, cuts])
                .range([params[key], target[key]])
        })
        setTimeout(function() {
            keys.forEach(function(k) {
                params[k] = parseInt(scales[k](current))
            })
            jsds.set('params', params)
            current++;
            if (current < cuts) {
                animateParamChange(jsds, target);
            }
        }, speed)
    }

    BHTMS.header('header')

    let jsdsFiringFields = BHTMS.JSDS.get('gridCellFiringFields')
    BHTMS.gridCellFiringFields("gridCellFiringFields")
    window.showOnly = (color) => {
        BHTMS.gridCellFiringFields.selectCellByColor(color)
    }
    window.toggleSim = function(on) {
        jsdsFiringFields.set('walks', on)
    }

    BHTMS.oneGridCell("oneGridCell")
    let jsdsOneGridCell = BHTMS.JSDS.get('oneGridCell')
    window.toggleOneGridCell = function(on) {
        jsdsOneGridCell.set('walks', on)
    }
    window.resetOneGridCell = function() {
        let targetParams = {
            orientation: 15,
            scale: 30
        }
        current = 0
        animateParamChange(jsdsOneGridCell, targetParams)
    }

    BHTMS.oneGridCellModule("oneGridCellModule")
    let jsdsOneGridCellModule = BHTMS.JSDS.get('oneGridCellModule')
    window.toggleOneGridCellModule = function(on) {
        jsdsOneGridCellModule.set('walks', on)
    }

    BHTMS.manyGridCellModules("manyGridCellModules", 16)
    let jsdsManyGridCellModules = BHTMS.JSDS.get('manyGridCellModules')
    window.toggleManyGcm = function(on) {
        jsdsManyGridCellModules.set('walks', on)
    }
    window.hideGcmLocationMarker = function(hide) {
        jsdsManyGridCellModules.set('hide-marker', hide)
    }
    window.manyGcmSelect = function(num) {
        let params = jsdsManyGridCellModules.get('params')
        params.gcmCount = num
        jsdsManyGridCellModules.set('params', params)
    }
    window.manyGcmSetMarker = function(on) {
        jsdsManyGridCellModules.set('hide-marker', ! on)
    }

    BHTMS.gcmAsSdr("gcmAsSdr")
}
