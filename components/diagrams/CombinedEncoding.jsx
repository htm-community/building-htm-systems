import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const offColor = '#FFF'
const diagramPadding = 40

class CombinedEncoding extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	encoding = undefined

	scalarEncoder = new BoundedScalarEncoder({
		w: 20, n: 100, min: 0, max: 1
	})
	// Discrete days of week
	dayOfWeekEncoder = new DayOfWeekCategoryEncoder({
		w: 3
	})
	// // Continuous days of week
	// dayOfWeekEncoder = new CyclicEncoder({
	// 	w: 5, n: 14,
	// 	min: 0, max: 6,
	// })
	dayOfMonthEncoder = new CyclicEncoder({
		w: 5, n: 40,
		min: 1, max: 31,
	})
	hourOfDayEncoder = new CyclicEncoder({
		w: 7, n: 100,
		min: 0, max: 23,
	})
	weekendEncoder = new WeekendEncoder({ w: 11 })

	// handle setting up when params are set/changed
	update() {
		this.encode()
		this.renderOutputCells()
	}

	encode() {
    const { data: { time, value } } = this.props
		const encoding = []
		// scalar
		this.scalarEncoder.encode(value).forEach(bit => {
			encoding.push(bit ? 'cyan' : offColor)
		})
		// day of week (discrete)
		this.dayOfWeekEncoder.encode(days[time.getDay()]).forEach(bit => {
			encoding.push(bit ? '#F3C300' : offColor)
		})
		// // day of week (continuous)
		// this.dayOfWeekEncoder.encode(time.getDay()).forEach(bit => {
		// 	encoding.push(bit ? '#F3C300' : offColor)
		// })
		// day of month
		this.dayOfMonthEncoder.encode(time.getDate()).forEach(bit => {
			encoding.push(bit ? '#DF0024' : offColor)
		})
		// weekend
		this.weekendEncoder.encode(time).forEach(bit => {
			encoding.push(bit ? '#00AC9F' : offColor)
		})
		// hour of day
		this.hourOfDayEncoder.encode(time.getHours()).forEach(bit => {
			encoding.push(bit ? '#2E6DB4' : offColor)
		})
		this.encoding = encoding
	}

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

	renderOutputCells() {
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2
		const g = this.root.select('.output-cells')
		const cols = Math.floor(Math.sqrt(this.encoding.length))
		const cellWidth = diagramWidth / cols

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

	render() {
		return (
			<svg id={this.props.id}
				ref={this.svgRef}>

				<g className="output-cells"></g>
				
			</svg>
		)
	}
}

CombinedEncoding.propTypes = {
	id: PropTypes.string.isRequired,
	data: PropTypes.object,
}

export default CombinedEncoding
