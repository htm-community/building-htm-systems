import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

const offColor = '#FFF'
const selectedColor = 'red'
const connectionColor = 'blue'
const inputColor = '#AAA'

const diagramPadding = 40

function getGreenToRed(percent) {
	let r, g;
	percent = 100 - percent;
	r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
	g = percent > 50 ? 255 : Math.floor((percent * 2) * 255 / 100);
	return rgbToHex(r, g, 0);
}

/* From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
function rgbToHex(r, g, b) {
	return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

class Permanences extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	// setup any time params change
	componentDidUpdate(prevProps) {
		this.update()
	}
	// setup on initial mount
	componentDidMount() {
		const diagramHeight = this.props.diagramWidth / 2
		// Sets up the d3 diagram on an SVG element.
		this.root = d3.select(`svg#${this.props.id}`)
			.attr('width', this.props.diagramWidth)
			.attr('height', diagramHeight)
	}

	// handle setting up when params are set/changed
	update() {
		if (this.props.permanences) {
			if (!this.props.showDistribution) {
				this.renderMinicolumns()
				this.renderInputSpace()
			} else {
				this.drawHistogram()
			}
		}
	}

	renderInputSpace() {
		const g = this.root.select('.input-space')
		// Split screen, this goes to the right
		g.attr('transform', `translate(${this.props.diagramWidth / 2},0)`)
		this.renderInput()
		this.renderPermanences()
		if (this.props.showConnections) {
			this.renderConnections()
		}
	}

	renderInput() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.input')
		const cols = Math.floor(Math.sqrt(this.props.encoding.length))
		const cellWidth = diagramWidth / cols / 2

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', d => {
					return d === 1 ? inputColor : 'none'
				})
				.attr('stroke', 'darkgrey')
				.attr('stroke-width', 0.5)
				.attr('fill-opacity', 1)
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
		const rects = g.selectAll('rect').data(this.props.encoding)
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
		const cols = Math.floor(Math.sqrt(this.props.encoding.length))
		const cellWidth = diagramWidth / cols / 2
		const selectedMinicolumn = this.props.selectedMinicolumn
		const pools = this.props.potentialPools[selectedMinicolumn]

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
					return (pools[i] % cols) * cellWidth
				})
				.attr('y', (d, i) => {
					return (Math.floor(pools[i] / cols)) * cellWidth
				})
				.attr('width', cellWidth)
				.attr('height', cellWidth)
		}

		// Update
		const rects = g.selectAll('rect').data(
			this.props.permanences[selectedMinicolumn]
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
		const g = this.root.select('.connections')
		const cols = Math.floor(Math.sqrt(this.props.encoding.length))
		const cellWidth = diagramWidth / cols / 2
		const connectionThreshold = this.props.connectionThreshold
		const selectedMinicolumn = this.props.selectedMinicolumn
		const pools = this.props.potentialPools[selectedMinicolumn]

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('r', cellWidth / 3)
				.attr('cx', (d, i) => {
					return (pools[i] % cols) * cellWidth + (cellWidth / 2)
				})
				.attr('cy', (d, i) => {
					return (Math.floor(pools[i] / cols)) * cellWidth + (cellWidth / 2)
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
		const circs = g.selectAll('circle')
			.data(this.props.permanences[selectedMinicolumn])
		treatCells(circs)

		// Enter
		const newRects = circs.enter().append('circle')
		treatCells(newRects)

		// Exit
		circs.exit().remove()
	}

	renderMinicolumns() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.minicolumns')
		const cols = Math.floor(Math.sqrt(this.props.permanences.length))
		const cellWidth = diagramWidth / cols / 2
		const selectedMinicolumn = this.props.selectedMinicolumn

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', (d, i) => i === selectedMinicolumn ? selectedColor : offColor)
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
		const rects = g.selectAll('rect')
			.data(this.props.permanences)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	drawHistogram() {
		const g = this.root.select('.histogram')
		const width = this.props.diagramWidth
		const height = 200

		const data = this.props.permanences[this.props.selectedMinicolumn]

		let x = d3.scaleLinear()
			.range([0, width]);

		let bins = d3.histogram()
			.domain(x.domain())
			.thresholds(x.ticks(50))
			(data);

		let maxBins = d3.max(bins, function (d) { return d.length; })
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


	// Triggers inconsistently!!
	selectMinicolumn(e) {
		const selectedMinicolumn = Number(e.target.getAttribute('data-index'))
		this.props.onUpdate(selectedMinicolumn)
	}

	render() {

		return (
			<svg id={this.props.id}
				ref={this.svgRef}>

				<g className="minicolumns" onClick={e => this.selectMinicolumn(e)}></g>

				<g className="input-space">
					<g className="input"></g>
					<g className="permanences"></g>
					<g className="connections"></g>
				</g>

				<g className="histogram">
					<line className="threshold" />
					<g className="axis" />
				</g>

			</svg>
		)
	}
}

Permanences.propTypes = {
	id: PropTypes.string.isRequired,
	diagramWidth: PropTypes.number,
	minicolumnCount: PropTypes.number,
	connectedPercent: PropTypes.number,
	data: PropTypes.object,
}

export default Permanences
