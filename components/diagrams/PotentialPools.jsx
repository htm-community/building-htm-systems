import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const offColor = '#FFF'
const combinedColor = '#BBB'
const ppColor = '#FDF542'
const selectedColor = 'red'

const diagramPadding = 40

// given a percentage, return boolean that will be true that percent of the time
const p = (percent) => Math.random() <= percent

// given a connection percentage and input size, return subset of indices
const getPotentialPool = (connectedPerc, size) => [...Array(size).keys()].filter(_ => p(connectedPerc))


class PotentialPools extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	encoding = undefined
	minicolumns = []
	selectedMinicolumn = 0

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
			this.renderMinicolumns()
			this.renderInputSpace()
			this.renderPotentialPools()
			this.renderOverlay()
		}
	}

	setupPotentialPools() {
		let size = this.encoding.length
		let connectedPercent = this.props.connectedPercent
		this.minicolumns = [...Array(this.props.minicolumnCount)].map(() => {
			return {
				potentialPool: getPotentialPool(connectedPercent, size)
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
		const cellWidth = diagramWidth / cols / 2

		// Split screen, this goes to the right
		g.attr('transform',  `translate(${this.props.diagramWidth / 2},0)`)

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', d => d)
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
		const rects = g.selectAll('rect').data(this.encoding)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
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

	renderPotentialPools() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.potential-pool')
		const cols = Math.floor(Math.sqrt(this.encoding.length))
		const cellWidth = diagramWidth / cols / 2

		// Split screen, this goes to the right
		g.attr('transform',  `translate(${this.props.diagramWidth / 2},0)`)

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
			this.minicolumns[this.selectedMinicolumn].potentialPool
		)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	renderOverlay() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.overlay')
		const cols = Math.floor(Math.sqrt(this.encoding.length))
		const cellWidth = diagramWidth / cols / 2
		const potentialPool = this.minicolumns[this.selectedMinicolumn].potentialPool

		// Split screen, this goes to the right
		g.attr('transform',  `translate(${this.props.diagramWidth / 2},0)`)

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('x', (d, i) => {
					return (i % cols) * cellWidth + 2
				})
				.attr('y', (d, i) => {
					return (Math.floor(i / cols)) * cellWidth + cellWidth - 2
				})
				.attr('font-size', cellWidth * .95)
				.attr('font-weight', 'bolder')
				.attr('fill', (d, i) => {
					if(d !== offColor) return potentialPool.includes(i) ?  'green' : 'white'
					return 'none'
				})
				.text((d, i) => {
					if(d !== offColor) return potentialPool.includes(i) ?  '✓' : '✘'
					return ''
				})
		}

		// Update
		const rects = g.selectAll('text').data(this.encoding)
		treatCells(rects)

		// Enter
		const newRects = rects.enter().append('text')
		treatCells(newRects)

		// Exit
		rects.exit().remove()
	}

	handleMouseMove(e) {
		this.selectedMinicolumn = Number(e.target.getAttribute('data-index'))
		this.update()
	}

	render() {

		return (
			<svg id={this.props.id}
				ref={this.svgRef}>

				<g className="minicolumns" onMouseMove={e => this.handleMouseMove(e)}></g>

				<g className="input-space"></g>
				<g className="potential-pool"></g>
				<g className="overlay"></g>
				
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
