let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')

module.exports = () => {

    let $connectionThresholdSlider = $('#connectionThresholdSlider')
    let $connectionThresholdDisplays = $('.connectionThresholdDisplay')
    let $independentVariablesSlider = $('#independentVariablesSlider')
    let $independentVariablesDisplays = $('.independentVariablesDisplay')
    let $inputSpaceDimensionsSlider = $('#inputSpaceDimensionsSlider')
    let $distributionCenterSlider = $('#distributionCenterSlider')
    let $distributionCenterDisplays = $('.distributionCenterDisplay')
    let $percConnectedDisplay = $('.percConnectedDisplay')
    let $percConnectedInFieldDisplay = $('.percConnectedInFieldDisplay')

    let permanences

    function updatePermanences() {
        let pool = localStorage.getItem('currentPotentialPool').split(',').map(m => parseInt(m))
        let poolIndices = SdrUtils.getActiveBits(pool)
        let independentVariables = parseInt($independentVariablesSlider.val())
        let distributionCenter = parseInt($distributionCenterSlider.val()) / 100
        permanences = d3.range(poolIndices.length)
                        .map(d3.randomBates(independentVariables))
                        .map((input) => {
                            return input + distributionCenter - 0.5
                        })
    }

    function updatePercentConnectedDisplay() {
        let connected = 0
        let threshold = parseInt($connectionThresholdSlider.val()) / 100
        let inputSpaceDimensions = parseInt($inputSpaceDimensionsSlider.val())
        let receptiveFieldSize = permanences.length
        permanences.forEach((perm) => {
            if (perm >= threshold) connected++
        })
        $percConnectedDisplay.html(Math.round(connected / inputSpaceDimensions * 100))
        $percConnectedInFieldDisplay.html(Math.round(connected / receptiveFieldSize * 100))
    }

    function updateDisplays() {
        $connectionThresholdDisplays.html(
            parseInt($connectionThresholdSlider.val()) / 100
        )
        $independentVariablesDisplays.html($independentVariablesSlider.val())
        $distributionCenterDisplays.html(
            parseInt($distributionCenterSlider.val()) / 100
        )
        updatePercentConnectedDisplay()
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

        let connectionThreshold = parseInt($connectionThresholdSlider.val()) / 100
        g.append('line')
            .attr('id', 'connectionThreshold')
            .attr('x1', x(connectionThreshold))
            .attr('x2', x(connectionThreshold))
            .attr('y1', 0)
            .attr('y2', 200)
            .attr('stroke', 'red')
            .attr('stroke-width', 4)
        // let connectionThresholdLine = svg.selectAll('#connectionThreshold')
        //     .data(connectionThreshold)
        //     .enter().append('line')
        //     .attr('id', 'connectionThreshold')
        //     .attr('x1', (d) => d)
        //     .attr('x2', (d) => d)
        //     .attr('y1', 10)
        //     .attr('y2', 100)

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

    }

    function redraw() {
        updatePermanences()
        updateDisplays()

    }

    $independentVariablesSlider.on('input', redraw)
    $inputSpaceDimensionsSlider.on('input', redraw)
    $distributionCenterSlider.on('input', redraw)
    $('#receptiveFieldPercSlider').on('input', redraw)

    $connectionThresholdSlider.on('input', () => {
        // We don't need to update permanences just to redraw the connection threshold line.
        updateDisplays()
    })


    updatePermanences()
    drawHistogram(permanences)
    updateDisplays()

}
