let utils = require('../../widgets/utils')
let html = require('./oneDimensionalMapping.tmpl.html')

module.exports = (elId) => {
    utils.loadHtml(html.default, elId, () => {

        let scale = 0.5
        let anchor = 0.0
        let sensitivity = 1.0
        let range = 0.1

        let width = 560
        let height = 400
        let xPixelDomain = [0, width]

        let barHeight = 30

        let $svg = d3.select('#' + elId + ' svg')

        $svg.attr('width', width).attr('height', height)

        let $barGroup = $svg.append('g').attr('class', 'bar')

        $barGroup.append('rect')
            .attr('width', width)
            .attr('height', barHeight)
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .attr('fill', 'none')

        let $wireGroup = $svg.append('g').attr('class', 'wires')

        let $sensitivity

        let $marker = $svg.append('rect').attr('class', 'marker')

        function updateDisplay() {

        }

    })
}
