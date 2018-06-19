let utils = require('../../../lib/utils')
let html = require('./categoryEncoder.tmpl.html')
let CategoryEncoderDisplay = require('CategoryEncoderDisplay')
let CategoryEncoder = require('CategoryEncoder')
let dat = require('dat.gui')

module.exports = (elementId, opts) => {

    let uiValues = {
        categories: 15,
        w: 3,
    }

    utils.loadHtml(html.default, elementId, () => {
        let $svg = d3.select('#' + elementId + ' svg')
        let $datGui = $('#' + elementId + ' .dat-gui')

        let allCategories = opts.categories
        let initialCategories = allCategories.slice(0, uiValues.categories)
        uiValues.w = opts.w

        let params = {
            size: 500,
            color: 'skyblue',
            w: uiValues.w,
            categories: initialCategories,
        }

        let encoderDisplay = new CategoryEncoderDisplay($svg, params)

        function setupDatGui($el, onChange) {
            let gui = new dat.GUI({
                autoPlace: false,
            })
            gui.add(uiValues, 'categories')
                .min(10).max(30).step(1).listen().onChange(onChange)
            gui.add(uiValues, 'w')
                .min(1).max(8).step(1).listen().onChange(onChange)
            $el.append(gui.domElement)
        }

        encoderDisplay.jsds.after('set', 'encoding', () => {
            encoderDisplay.updateDisplay()
        })
        encoderDisplay.jsds.after('set', 'value', (value) => {
            let encoding = encoderDisplay.encoder.encode(value)
            encoderDisplay.jsds.set('encoding', encoding)
        })

        let currentIndex = 0
        setInterval(() => {
            encoderDisplay.jsds.set('value', allCategories[currentIndex])
            let cats = encoderDisplay.encoder.categories.length
            if (currentIndex++ >= cats-1 ) {
                currentIndex = 0
            }
        }, 600)

        setupDatGui($datGui, () => {
            encoderDisplay.encoder = new CategoryEncoder({
                w: uiValues.w,
                categories: allCategories.slice(0, uiValues.categories),
            })
            encoderDisplay.render()
        })

        // Start
        encoderDisplay.render()
        encoderDisplay.jsds.set('value', allCategories[0])

    })

}
