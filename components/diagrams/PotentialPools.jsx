import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const offColor = '#FFF'
const combinedColor = '#BBB'
const ppColor = '#FDF542'

const diagramPadding = 40

const p = (percent) => Math.random() <= percent

function createPotentialPool(connectedPerc, size) {
	let pool = [];
	[...Array(size)].forEach((v, i) => {
		if (p(connectedPerc)) {
			pool.push(i)
		}
	})
	return pool
}


class PotentialPools extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	encoding = undefined
	minicolumns = []

	scalarEncoder = new BoundedScalarEncoder({
		w: 20, n: 100, min: 0, max: 1
	})
	dayOfWeekEncoder = new DayOfWeekCategoryEncoder({
		w: 3
	})
	dayOfMonthEncoder = new CyclicEncoder({
		w: 5, n: 40,
		min: 1, max: 31,
	})
	hourOfDayEncoder = new CyclicEncoder({
		w: 7, n: 100,
		min: 0, max: 23,
	})
	weekendEncoder = new WeekendEncoder({ w: 11 })

	// setup any time params change
	componentDidUpdate(prevProps) {
		this.update()
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
		if (this.props.data.time) {
			this.encode()
			if(this.minicolumns.length === 0) {
				this.setupPotentialPools()
			}
			this.renderInputSpace()
			this.renderPotentialPools()
		}
	}

	setupPotentialPools() {
		let size = this.encoding.length
		let connectedPercent = this.props.connectedPercent
		this.minicolumns = [...Array(this.props.minicolumnCount)].map(() => {
			return {
				potentialPool: createPotentialPool(connectedPercent, size)
			}
		})
	}

	encode() {
    const { data: { time, value }, combined } = this.props
		const encoding = []
		function colorFn(bit) {
			encoding.push(bit ? combinedColor : offColor)
		}

		// scalar
		this.scalarEncoder.encode(value).forEach(colorFn)
		// day of week (discrete)
		this.dayOfWeekEncoder.encode(days[time.getDay()]).forEach(colorFn)
		// day of month
		this.dayOfMonthEncoder.encode(time.getDate()).forEach(colorFn)
		// hour of day
		this.hourOfDayEncoder.encode(time.getHours()).forEach(colorFn)
		// weekend
		this.weekendEncoder.encode(time).forEach(colorFn)

		this.encoding = encoding
	}

	renderInputSpace() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.input-space')
		const cols = Math.floor(Math.sqrt(this.encoding.length))
		const cellWidth = diagramWidth / cols

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', d => d)
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
		}

		// Update
		const rects = g.selectAll('rect').data(this.encoding)
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
		const cols = Math.floor(Math.sqrt(this.encoding.length))
		const cellWidth = diagramWidth / cols

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', ppColor)
				.attr('stroke', 'none')
				.attr('fill-opacity', 1.0)
				.attr('x', (d, i) => {
					return (d % cols) * cellWidth
				})
				.attr('y', (d, i) => {
					return (Math.floor(d / cols)) * cellWidth
				})
				.attr('width', cellWidth)
				.attr('height', cellWidth)
		}

		let selectedMinicolumn = 0

		// Update
		const rects = g.selectAll('rect').data(
			this.minicolumns[selectedMinicolumn].potentialPool
		)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	render() {

		return (
			<svg className="debug" id={this.props.id}
				ref={this.svgRef}>

				<g className="minicolumns"></g>

				<g className="potential-pool"></g>
				<g className="input-space"></g>
				
			</svg>
		)
	}
}

PotentialPools.propTypes = {
	id: PropTypes.string.isRequired,
	diagramWidth: PropTypes.number,
	minicolumnClount: PropTypes.number,
	connectedPercent: PropTypes.number,
	data: PropTypes.object,
}

export default PotentialPools
