let utils = require('../../../lib/utils')
let html = require('./prototype_1.tmpl.html')
let YAML = require('yamljs')
let rawMap = YAML.load('./research-map-2.yaml')
let root
let $el, $svg

function loadData() {
    root = d3.hierarchy(rawMap.root)
}

function render() {
    let margin = {top: 30, right: 20, bottom: 30, left: 20},
        width = 560,
        barHeight = 30,
        barWidth = (width - margin.left - margin.right) * 0.8

    let i = 0,
        duration = 400

    let diagonal = d3.linkHorizontal()
        .x(function(d) { return d.y })
        .y(function(d) { return d.x })

    $svg = $el.append('svg')
        .attr('width', width) // + margin.left + margin.right)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    root.x0 = 0
    root.y0 = 0
    update(root)

    function update(source) {

        // Compute the flattened node list.
        let nodes = root.descendants()

        let height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom)

        d3.select('svg').transition()
            .duration(duration)
            .attr('height', height)

        d3.select(self.frameElement).transition()
            .duration(duration)
            .style('height', height + 'px')

        // Compute the 'layout'. TODO https://github.com/d3/d3-hierarchy/issues/67
        let index = -1
        root.eachBefore(function(n) {
            n.x = ++index * barHeight
            n.y = n.depth * 20
        })

        // Update the nodes…
        let node = $svg.selectAll('.node')
            .data(nodes, function(d) {
                return d.id || (d.id = ++i)
            })

        let nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', function(d) { return 'translate(' + source.y0 + ',' + source.x0 + ')' })
            .style('opacity', 0)

        // Enter any new nodes at the parent's previous position.
        nodeEnter.append('rect')
            .attr('y', -barHeight / 2)
            .attr('height', barHeight)
            .attr('width', barWidth)
            .style('fill', color)
            .on('click', click)

        // let fo = nodeEnter
        //     .append('foreignObject')
        //     .attr('width', barWidth)
        //     .attr('height', barHeight)
        //     .attr('x', 0)
        //     .attr('y', -20)
        // let div = fo.append('xhtml:div')
        //     .html(d => {
        //         // Here is where we'll decide what text to render into the box.
        //         if (d.data.name === 'summary')
        //             return d.data.text
        //         else
        //             return d.data.name
        //     })


        // nodeEnter.append('foreignObject')
        //     .attr({
        //         'y': -barHeight / 2,
        //         'width': barWidth,
        //         'class': 'content'
        //     })

        // let div = nodeEnter.append('xhtml:div')
        //     .append('div')
        //     .attr({
        //         'class': 'content'
        //     })
        //     .text(d => {
        //         // Here is where we'll decide what text to render into the box.
        //         if (d.data.name === 'summary')
        //             return d.data.text
        //         else
        //             return d.data.name
        //     })

        // let foHeight = div[0][0].getBoundingClientRect().height
        // fo.attr({
        //     'height': foHeight
        // })

        nodeEnter.append('text')
            .attr('dy', 3.5)
            .attr('dx', 5.5)
            .text(function(d) {
                return d.data.name
                // // Here is where we'll decide what text to render into the box.
                // if (d.data.name === 'summary')
                //     return d.data.text
                // else
                //     return d.data.name
            })

        // Transition nodes to their new position.
        nodeEnter.transition()
            .duration(duration)
            .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')' })
            .style('opacity', 1)

        node.transition()
            .duration(duration)
            .attr('transform', function(d) { return 'translate(' + d.y + ',' + d.x + ')' })
            .style('opacity', 1)
            .select('rect')
            .style('fill', color)

        // Transition exiting nodes to the parent's new position.
        node.exit().transition()
            .duration(duration)
            .attr('transform', function(d) { return 'translate(' + source.y + ',' + source.x + ')' })
            .style('opacity', 0)
            .remove()

        // Update the links…
        let link = $svg.selectAll('.link')
            .data(root.links(), function(d) { return d.target.id })

        // Enter any new links at the parent's previous position.
        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', function(d) {
                let o = {x: source.x0, y: source.y0}
                return diagonal({source: o, target: o})
            })
            .transition()
            .duration(duration)
            .attr('d', diagonal)

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr('d', diagonal)

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
                let o = {x: source.x, y: source.y}
                return diagonal({source: o, target: o})
            })
            .remove()

        // Stash the old positions for transition.
        root.each(function(d) {
            d.x0 = d.x
            d.y0 = d.y
        })
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children
            d.children = null
        } else {
            d.children = d._children
            d._children = null
        }
        update(d)
    }

    function color(d) {
        return d._children ? '#3182bd' : d.children ? '#c6dbef' : '#fd8d3c'
    }
}

function collapse() {
    root.descendants().forEach(d => {
        // turn off children on lower levels for initial render
        if (d.depth > 0 && d.children) {
            d._children = d.children
            d.children = null
        }
    })
}

function researchMap(elId) {
    loadData()
    collapse()
    utils.loadHtml(html.default, 'research-map', () => {
        $el = d3.select('#' + elId)
        render()
    })
}

window.BHTMS = {
    researchMap: researchMap
}
