let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')

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
        width: 560,
        rowLength: 19,
        gradientFill: true,
        connectionColor: 'navy',
    }
    let potentialPool
    let permanences
    let $hoverBox = createHoverBox()

    function createHoverBox() {
        $('<div id="hoverBox" style="position:absolute;display:none">').appendTo('body')
        return $('#hoverBox')
    }

    function updatePermanences() {
        let independentVariables = parseInt($independentVariablesSlider.val())
        let distributionCenter = parseInt($distributionCenterSlider.val()) / 100
        permanences = d3.range(potentialPool.length)
            .map(d3.randomBates(independentVariables))
            .map((val, i) => {
                if (potentialPool[i] === 1) {
                    return val + distributionCenter - 0.5
                } else {
                    return null
                }
            })
    }

    function updatePercentConnectedDisplay() {
        let connected = 0
        let threshold = parseInt($connectionThresholdSlider.val()) / 100
        let receptiveFieldSize = SdrUtils.population(permanences)
        permanences.forEach((perm) => {
            if (perm >= threshold) connected++
        })
        $percConnectedDisplay.html(Math.round(connected / inputSpaceDimensions * 100))
        $percConnectedInFieldDisplay.html(Math.round(connected / receptiveFieldSize * 100))
    }


    function updateDisplays() {
        let connectionThreshold = parseInt($connectionThresholdSlider.val()) / 100
        let sdr = new SdrDrawing(permanences, 'receptiveFieldDemo')
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
        sdr.onCell('mouseenter', (perm, index) => {
            let formattedPerm = Math.round(perm * 100) / 100
            let coords = d3.mouse(d3.select('body').node())
            $hoverBox.css({left: coords[0] + 10, top: coords[1] + 10})
            $hoverBox.html(formattedPerm).show()
        }).onCell('mouseout', (perm, index) => {
            $hoverBox.hide()
        })
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

    $connectionThresholdSlider.on('input', updateDisplays)

    $independentVariablesSlider.on('input', () => {
        updatePermanences()
        updateDisplays()
    })

    $distributionCenterSlider.on('input', () => {
        updatePermanences()
        updateDisplays()
    })

    $(document).on('potentialPoolUpdate', (event, pool) => {
        potentialPool = pool
        updatePermanences()
        updateDisplays()
    })

}
