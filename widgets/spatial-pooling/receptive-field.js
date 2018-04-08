let SdrUtils = require('SdrUtils')
let ReceptiveField = require('ReceptiveField')
let utils = require('../utils')

module.exports = () => {
    let $receptiveFieldPercSlider = $('#receptiveFieldPercSlider')
    let $receptiveFieldPercDisplay = $('.receptiveFieldPercDisplay')
    let $connectionThresholdSlider = $('#connectionThresholdSlider')
    let $connectionThresholdDisplays = $('.connectionThresholdDisplay')
    let $independentVariablesSlider = $('#independentVariablesSlider')
    let $independentVariablesDisplays = $('.independentVariablesDisplay')
    let $distributionCenterSlider = $('#distributionCenterSlider')
    let $distributionCenterDisplays = $('.distributionCenterDisplay')
    let $percConnectedDisplay = $('.percConnectedDisplay')
    let $percConnectedInFieldDisplay = $('.percConnectedInFieldDisplay')
    let inputSpaceDimensions = 400

    let drawOptions = {
        width: 600,
        height: 310,
        cellSize: 20,
        rowLength: 28,
        gradientFill: true,
        connectionColor: 'navy',
    }
    let pool
    let permanences
    let connections

    function updatePotentialPools() {
        pool = utils.getRandomReceptiveField(
            parseInt($receptiveFieldPercSlider.val()) / 100,
            inputSpaceDimensions
        )
    }

    function updatePermanences() {
        let poolIndices = SdrUtils.getActiveBits(pool)
        let independentVariables = parseInt($independentVariablesSlider.val())
        let distributionCenter = parseInt($distributionCenterSlider.val()) / 100
        let threshold = parseInt($connectionThresholdSlider.val()) / 100
        permanences = d3.range(pool.length)
                        .map(d3.randomBates(independentVariables))
                        .map((val, i) => {
                            if (pool[i] === 1) {
                                return val + distributionCenter - 0.5
                            } else {
                                return null
                            }
                        })
        connections = permanences.map((perm) => {
            if (perm > threshold) return 1
            return 0
        })
    }

    function updatePercentConnectedDisplay() {
        let connected = 0
        let threshold = parseInt($connectionThresholdSlider.val()) / 100
        let receptiveFieldSize = SdrUtils.population(pool)
        permanences.forEach((perm) => {
            if (perm >= threshold) connected++
        })
        $percConnectedDisplay.html(Math.round(connected / inputSpaceDimensions * 100))
        $percConnectedInFieldDisplay.html(Math.round(connected / receptiveFieldSize * 100))
    }


    function updateDisplays() {
        let connectionThreshold = parseInt($connectionThresholdSlider.val()) / 100
        updatePermanences()
        let sdr = new ReceptiveField(permanences, 'receptiveFieldDemo')
        drawOptions.threshold = connectionThreshold
        sdr.draw(drawOptions)
        $receptiveFieldPercDisplay.html($receptiveFieldPercSlider.val())

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

    function drawHistogram(rawData) {
        let formatCount = d3.format(",.0f");
        let data = rawData.filter(d => d !== null)

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

        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

    }

    function redraw() {
        // updatePotentialPools()
        updatePermanences()
        updateDisplays()
    }


    $receptiveFieldPercSlider.on('input', function () {
        let targetDensity = parseInt(this.value) / 100
        pool = SdrUtils.adjustTo(pool, targetDensity)
        updatePermanences()
        drawHistogram(permanences)
        updateDisplays()
    });

    $independentVariablesSlider.on('input', redraw)
    $distributionCenterSlider.on('input', redraw)
    $('#receptiveFieldPercSlider').on('input', redraw)

    $connectionThresholdSlider.on('input', () => {
        // We don't need to update permanences just to redraw the connection threshold line.
        updateDisplays()
    })


    updatePotentialPools()
    updatePermanences()
    drawHistogram(permanences)
    updateDisplays()
}
