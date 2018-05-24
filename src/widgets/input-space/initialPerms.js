let SdrUtils = require('SdrUtils')
let SdrDrawing = require('SdrDrawing')
let JSDS = require('JSDS')
let utils = require('../utils')
let html = require('./initialPerms.tmpl.html')

module.exports = (elementId) => {

    let jsds = JSDS.get('spatial-pooling')

    utils.loadHtml(html.default, elementId, () => {
        console.log("Running %s JS", elementId)
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

        let currentMousePos = { x: -1, y: -1 };
        $(document).mousemove(function(event) {
            currentMousePos.x = event.pageX;
            currentMousePos.y = event.pageY;
        });

        let drawOptions = {
            width: 560,
            rowLength: 19,
            gradientFill: true,
            connectionColor: 'navy',
        }
        let $hoverBox = createHoverBox()

        function createHoverBox() {
            $('<div id="hoverBox" style="position:absolute;display:none">').appendTo('body')
            return $('#hoverBox')
        }

        function getRandomPerms() {
            let independentVariables = parseInt($independentVariablesSlider.val())
            let distributionCenter = parseInt($distributionCenterSlider.val()) / 100
            let selectedMiniColumn = jsds.get('selectedMiniColumn')
            let potentialPool = jsds.get('potentialPools')[selectedMiniColumn]
            let permanences = d3.range(potentialPool.length)
                .map(d3.randomBates(independentVariables))
                .map((val, i) => {
                    if (potentialPool[i] === 1) {
                        return val + distributionCenter - 0.5
                    } else {
                        return null
                    }
                }).filter(v => v !== null)
            return permanences
        }

        function updatePercentConnectedDisplay() {
            let connected = 0
            let threshold = parseInt($connectionThresholdSlider.val()) / 100
            let permanences = jsds.get('permanences')
            let receptiveFieldSize = SdrUtils.population(permanences)
            permanences.forEach((perm) => {
                if (perm >= threshold) connected++
            })
            $percConnectedDisplay.html(Math.round(connected / inputSpaceDimensions * 100))
            $percConnectedInFieldDisplay.html(Math.round(connected / receptiveFieldSize * 100))
        }


        function updateDisplays() {
            let connectionThreshold = parseInt($connectionThresholdSlider.val()) / 100
            let permanences = jsds.get('permanences')
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
                $hoverBox.css({
                    left: currentMousePos.x + 10,
                    top: currentMousePos.y + 10
                })
                $hoverBox.html(formattedPerm).show()
            }).onCell('mouseout', (perm, index) => {
                $hoverBox.hide()
            })
            updatePercentConnectedDisplay()
            drawHistogram()
        }

        function drawHistogram() {
            let data = jsds.get('permanences')
            let svg = d3.select("svg#receptiveFieldHistogram")

            let margin = {top: 10, right: 30, bottom: 30, left: 30},
                width = +svg.attr("width") - margin.left - margin.right,
                height = +svg.attr("height") - margin.top - margin.bottom

            let histGroup = svg.selectAll('g.hist')

            histGroup.enter().append('g')
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr('class', 'hist')

            let x = d3.scaleLinear()
                .range([0, width]);

            let bins = d3.histogram()
                .domain(x.domain())
                .thresholds(x.ticks(50))
                (data);

            let maxBins = d3.max(bins, function(d) { return d.length; })
            let y = d3.scaleLinear()
                .domain([0, maxBins])
                .range([0, height]);

            function treatRects(rects) {
                let rectWidth = x(bins[0].x1) - x(bins[0].x0)
                rects
                    .attr('class', 'bar')
                    .attr('x', (d, i) => {
                        return i * rectWidth
                    })
                    .attr('y', (d, i) => {
                        return y(maxBins - bins[i].length)
                    })
                    .attr('height', (d, i) => {
                        return y(bins[i].length)
                    })
                    .attr('width', rectWidth)
                    .attr('fill', 'steelblue')
            }

            let rects = histGroup.selectAll('rect.bar').data(bins)
            treatRects(rects)

            let newRects = rects.enter().append('rect')
            treatRects(newRects)

            rects.exit().remove()

            let connectionThreshold = parseInt($connectionThresholdSlider.val()) / 100

            svg.select('line.threshold')
                .attr('id', 'connectionThreshold')
                .attr('x1', x(connectionThreshold))
                .attr('x2', x(connectionThreshold))
                .attr('y1', 0)
                .attr('y2', 200)
                .attr('stroke', 'red')
                .attr('stroke-width', 4)

            histGroup.selectAll('g.axis').data([null]).enter().append('g')
                .attr("class", "axis axis--x")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x));

        }

        function redraw() {
            jsds.set('permanences', getRandomPerms())
            updateDisplays()
        }

        $connectionThresholdSlider.on('input', updateDisplays)
        $independentVariablesSlider.on('input', redraw)
        $distributionCenterSlider.on('input', redraw)

        jsds.after('set', 'selectedMiniColumn', updateDisplays)
        jsds.after('set', 'potentialPools', updateDisplays)
        jsds.after('set', 'permanences', updateDisplays)

        redraw()

    })

}
