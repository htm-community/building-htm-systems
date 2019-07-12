import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

// FIXME: consolidate color handling
const ppColor = '#FDF542'
const diagramPadding = 40
const selectedColor = 'red'
const connectionColor = 'blue'
const inputColor = '#AAA'

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

class DutyCycles extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	// setup any time params change
	componentDidUpdate(prevProps) {
		this.update()
	}

	// setup on initial mount
	componentDidMount() {
		// Sets up the d3 diagram on an SVG element.
		this.root = d3.select(`svg#${this.props.id}`)
			.attr('width', this.props.diagramWidth)
			.attr('height', this.props.diagramWidth / 2)
	}

	// handle setting up when params are set/changed
	update() {
		if (this.props.dutyCycles) {
			this.renderInputSpace()
			this.renderCompetition()
		}
	}

	renderInputSpace() {
		const g = this.root.select('.input-space')
		// Split screen, this goes to the right
		g.attr('transform', `translate(${this.props.diagramWidth / 2},0)`)
		this.renderInput()
		this.renderPotentialPools()
		this.renderConnections()
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

	renderPotentialPools() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.potential-pool')
		const cols = Math.floor(Math.sqrt(this.props.encoding.length))
		const cellWidth = diagramWidth / cols / 2

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', ppColor)
				.attr('stroke', 'none')
				.attr('fill-opacity', 0.5)
				.attr('x', (d, i) => {
					return (d % cols) * cellWidth
				})
				.attr('y', (d, i) => {
					return (Math.floor(d / cols)) * cellWidth
				})
				.attr('width', cellWidth)
				.attr('height', cellWidth)
		}

		// Update
		const rects = g.selectAll('rect').data(
			this.props.potentialPools[this.props.selectedMinicolumn]
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
		const encoding = this.props.encoding
		const cols = Math.floor(Math.sqrt(encoding.length))
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
				.attr('stroke', (d, i) => {
					let fill = 'none'
					if (d > connectionThreshold) {
						fill = connectionColor
					}
					return fill
				})
				.attr('fill', (d, i) => {
					let fill = 'none'
					if (d > connectionThreshold && encoding[pools[i]] === 1) {
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

	renderCompetition() {
		if (this.props.dutyCycles) {
			this.renderMinicolumns()
		}
	}

	renderMinicolumns() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.minicolumns')
		const cols = Math.floor(Math.sqrt(this.props.dutyCycles.length))
		const cellWidth = diagramWidth / cols / 2
		const selectedMinicolumn = this.props.selectedMinicolumn

		const maxOverlap = Math.max(...this.props.dutyCycles)
		const minOverlap = Math.min(...this.props.dutyCycles)
		// const maxOverlap = 1.0
		// const minOverlap = 0.0
		const colorScale = d3.scaleLinear([minOverlap, maxOverlap], [0, 100])

		const winners = this.props.winners

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', (adc) => {
					return '#' + getGreenToRed(colorScale(adc))
				})
				.attr('stroke', (d, i) => {
					if (winners.includes(i)) return 'black'
					if (d.index === selectedMinicolumn) return selectedColor
					return 'darkgrey'
				})
				.attr('stroke-width', (d, i) => {
					if (winners.includes(i) || i === selectedMinicolumn) return 1.5
					return 0.5
				})
				.attr('fill-opacity', (d, i) => {
					if (i === selectedMinicolumn) return 1.0
					return 0.5
				})
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
			.data(this.props.dutyCycles)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	// Triggers consistently
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
					<g className="potential-pool"></g>
					<g className="connections"></g>
				</g>

			</svg>
		)
	}
}

DutyCycles.propTypes = {
	id: PropTypes.string.isRequired,
	diagramWidth: PropTypes.number,
	minicolumnCount: PropTypes.number,
	connectedPercent: PropTypes.number,
	data: PropTypes.object,
}

export default DutyCycles
