import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const offColor = '#FFF'
const combinedColor = '#BBB'
const scalarColor = '#68228B'
const dayOfWeekColor = '#F3C300'
const dayOfMonthColor = '#DF0024'
const hourOfDayColor = '#2E6DB4'
const weekendColor = '#00AC9F'

const diagramPadding = 40

class CombinedEncoding extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	encoding = undefined

	scalarEncoder = new BoundedScalarEncoder({
		w: 10, n: 50, min: -1, max: 1
	})
	dayOfWeekEncoder = new DayOfWeekCategoryEncoder({
		w: 3
	})
	dayOfMonthEncoder = new CyclicEncoder({
		w: 5, n: 20,
		min: 1, max: 31,
	})
	hourOfDayEncoder = new CyclicEncoder({
		w: 7, n: 50,
		min: 0, max: 23,
	})
	weekendEncoder = new WeekendEncoder({ w: 7 })

	// handle setting up when params are set/changed
	update() {
		this.encode()
		this.renderOutputCells()
	}

	encode() {
		const { data: { time, value }, combined } = this.props
		const encoding = []
		const jointColor = combined == 'combined' ? combinedColor : undefined;
		// scalar
		this.scalarEncoder.encode(value).forEach(bit => {
			encoding.push(bit ? jointColor || scalarColor : offColor)
		})
		// day of week (discrete)
		this.dayOfWeekEncoder.encode(days[time.getDay()]).forEach(bit => {
			encoding.push(bit ? jointColor || dayOfWeekColor : offColor)
		})
		// day of month
		this.dayOfMonthEncoder.encode(time.getDate()).forEach(bit => {
			encoding.push(bit ? jointColor || dayOfMonthColor : offColor)
		})
		// hour of day
		this.hourOfDayEncoder.encode(time.getHours()).forEach(bit => {
			encoding.push(bit ? jointColor || hourOfDayColor : offColor)
		})
		// weekend
		this.weekendEncoder.encode(time).forEach(bit => {
			encoding.push(bit ? jointColor || weekendColor : offColor)
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
			.attr('height', this.props.diagramWidth * .8)
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
