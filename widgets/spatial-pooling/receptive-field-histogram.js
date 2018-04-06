let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')

module.exports = () => {

    let $connectionThresholdSlider = $('#connectionThresholdSlider')
    let $connectionThresholdDisplays = $('.connectionThresholdDisplay')
    let $independentVariablesSlider = $('#independentVariablesSlider')
    let $independentVariablesDisplays = $('.independentVariablesDisplay')
    let $inputSpaceDimensionsSlider = $('#inputSpaceDimensionsSlider')
    let permanences

    function updatePermanences() {
        let pool = localStorage.getItem('currentPotentialPool').split(',').map(m => parseInt(m))
        let poolIndices = SdrUtils.getActiveBits(pool)
        let independentVariable = parseInt($independentVariablesSlider.val())
        permanences = d3.range(poolIndices.length).map(d3.randomBates(independentVariable))
    }

    function updateDisplays() {
        $connectionThresholdDisplays.html($connectionThresholdSlider.val())
        $independentVariablesDisplays.html($independentVariablesSlider.val())
        drawHistogram(permanences)
    }

    function drawHistogram(data) {
        let formatCount = d3.format(",.0f");

        $('svg#receptiveFieldHistogram').html('')
        let svg = d3.select("svg#receptiveFieldHistogram")
        margin = {top: 10, right: 30, bottom: 30, left: 30},
            width = +svg.attr("width") - margin.left - margin.right,
            height = +svg.attr("height") - margin.top - margin.bottom,
            g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        let x = d3.scaleLinear()
            .rangeRound([0, width]);

        let bins = d3.histogram()
            .domain(x.domain())
            .thresholds(x.ticks(40))
            (data);

        let y = d3.scaleLinear()
            .domain([0, d3.max(bins, function(d) { return d.length; })])
            .range([height, 0]);

        let bar = g.selectAll(".bar")
            .data(bins)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
            .attr("height", function(d) { return height - y(d.length); });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", 6)
            .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { return formatCount(d.length); });

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

    }

    // $connectionThresholdSlider.on('input', () => {
    //     updatePermanences()
    //     updateDisplays()
    // })
    $independentVariablesSlider.on('input', () => {
        updatePermanences()
        updateDisplays()
    })
    $inputSpaceDimensionsSlider.on('input', () => {
        updatePermanences()
        updateDisplays()
    })
    $('#receptiveFieldPercSlider').on('input', () => {
        updatePermanences()
        updateDisplays()
    })


    updatePermanences()
    drawHistogram(permanences)
    updateDisplays()

}
