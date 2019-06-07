import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

const offColor = '#FFF'
const selectedColor = 'red'
const connectionColor = 'blue'

const diagramPadding = 40

function getGreenToRed(percent){
	let r, g;
	percent = 100 - percent;
	r = percent < 50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
	g = percent > 50 ? 255 : Math.floor((percent*2)*255/100);
	return rgbToHex(r, g, 0);
}

/* From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
function rgbToHex(r, g, b) {
	return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// given a percentage, return boolean that will be true that percent of the time
const p = (percent) => Math.random() <= percent

class Permanences extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	minicolumns = []
	selectedMinicolumn = 0

	// setup any time params change
	componentDidUpdate(prevProps) {
		if (this.minicolumns.length === 0
			|| prevProps.connectionDistribution !== this.props.connectionDistribution
			|| prevProps.distributionCenter !== this.props.distributionCenter) {
			this.setupInitialConnectionStrengths()
		}
		this.update(prevProps)
	}
	// setup on initial mount
	componentDidMount() {
		// Sets up the d3 diagram on an SVG element.
		this.root = d3.select(`svg#${this.props.id}`)
			.attr('width', this.props.diagramWidth)
			.attr('height', this.props.diagramWidth)
	}
	
	// handle setting up when params are set/changed
	update() {
		this.renderMinicolumns()
		this.renderPermanences()
		this.renderConnections()
		this.drawHistogram()
	}
	/*
	function getRandomPerms() {
		let independentVariables = uiValues['distr. spread']
		let distributionCenter = uiValues['distr. center']
		let selectedMiniColumn = ppds.get('selectedMiniColumn')
		let potentialPool = ppds.get('potentialPools')[selectedMiniColumn]
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

	*/
  
	setupInitialConnectionStrengths() {
		const batesFn = d3.randomBates(this.props.connectionDistribution)
		const center = this.props.distributionCenter
    this.minicolumns = [...Array(this.props.minicolumnCount)].map(_ => 
      [...Array(this.props.inputSpaceSize)].map(_ => 
        p(this.props.connectedPercent) ?  batesFn() + center - 0.5 : undefined, this), this)
	} 

	renderMinicolumns() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.minicolumns')
		const cols = Math.floor(Math.sqrt(this.minicolumns.length))
		const cellWidth = diagramWidth / cols / 2
		const selectedMinicolumn = this.selectedMinicolumn

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', (d, i) => i === selectedMinicolumn ? selectedColor : 'none')
				.attr('stroke', 'darkgrey')
				.attr('stroke-width', 0.5)
				.attr('fill-opacity', 0.5)
				.attr('x', (d, i) => {
					return (i % cols) * cellWidth
				})
				.attr('y', (d, i) => {
					return (Math.floor(i / cols)) * cellWidth
				})
				.attr('width', cellWidth)
				.attr('height', cellWidth)
				.attr('data-index', (d, i) => i)
		}

		// Update
		const rects = g.selectAll('rect').data(this.minicolumns)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	renderPermanences() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.permanences')
		const cols = Math.floor(Math.sqrt(this.props.inputSpaceSize))
		const cellWidth = diagramWidth / cols / 2

		// Split screen, this goes to the right
		g.attr('transform',  `translate(${this.props.diagramWidth / 2},0)`)

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', (d) => {
					let fill = offColor
					if (d !== undefined) {
						fill = '#' + getGreenToRed(d * 100)
					}
					return fill
				})
				.attr('stroke', 'none')
				.attr('fill-opacity', 0.5)
				.attr('x', (d, i) => {
					return (i % cols) * cellWidth
				})
				.attr('y', (d, i) => {
					return (Math.floor(i / cols)) * cellWidth
				})
				.attr('width', cellWidth)
				.attr('height', cellWidth)
		}

		// Update
		const rects = g.selectAll('rect').data(
			this.minicolumns[this.selectedMinicolumn]
		)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	renderConnections() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const connectionThreshold = this.props.connectionThreshold
		const g = this.root.select('.connections')
		const cols = Math.floor(Math.sqrt(this.props.inputSpaceSize))
		const cellWidth = diagramWidth / cols / 2
		
		// Split screen, this goes to the right
		g.attr('transform',  `translate(${this.props.diagramWidth / 2},0)`)

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('r', cellWidth / 3)
				.attr('cx', (d, i) => {
					return (i % cols) * cellWidth + (cellWidth / 2)
				})
				.attr('cy', (d, i) => {
					return (Math.floor(i / cols)) * cellWidth + (cellWidth / 2)
				})
				.attr('fill', (d, i) => {
					let fill = 'none'
					if (d > connectionThreshold) {
						fill = connectionColor
					}
					return fill
				})
		}

		// Update
		const circs = g.selectAll('circle').data(this.minicolumns[this.selectedMinicolumn])
		treatCells(circs)

		// Enter
		const newRects = circs.enter().append('circle')
		treatCells(newRects)

		// Exit
		circs.exit().remove()
	}

	drawHistogram() {
		const g = this.root.select('.histogram')
		const width = this.props.diagramWidth
		const height = 200

		const data = this.minicolumns[this.selectedMinicolumn]

		// Split screen, this goes to the right
		g.attr('transform',  `translate(0,240)`)

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

		let rects = g.selectAll('rect.bar').data(bins)
		treatRects(rects)

		let newRects = rects.enter().insert('rect', ':first-child')
		treatRects(newRects)

		rects.exit().remove()

		let connectionThreshold = this.props.connectionThreshold

		g.select('line.threshold')
			.attr('id', 'connectionThreshold')
			.attr('x1', x(connectionThreshold))
			.attr('x2', x(connectionThreshold))
			.attr('y1', 0)
			.attr('y2', 200)
			.attr('stroke', 'red')
			.attr('stroke-width', 4)

		g.selectAll('g.axis')
			.attr("class", "axis axis--x")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x))

	}


	handleMouseMove(e) {
		this.selectedMinicolumn = Number(e.target.getAttribute('data-index'))
		this.update()
	}

	render() {

		return (
			<svg id={this.props.id}
				className="debug"
				ref={this.svgRef}>

				<g className="minicolumns" onMouseMove={e => this.handleMouseMove(e)}></g>

				<g className="input-space"></g>
				<g className="permanences"></g>
				<g className="connections"></g>

				<g className="histogram">
					<line className="threshold" />
					<g className="axis"/>
				</g>
				
			</svg>
		)
	}
}

Permanences.propTypes = {
	id: PropTypes.string.isRequired,
	diagramWidth: PropTypes.number,
	minicolumnClount: PropTypes.number,
	connectedPercent: PropTypes.number,
	data: PropTypes.object,
}

export default Permanences
