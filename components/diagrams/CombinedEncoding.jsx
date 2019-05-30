import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const offColor = '#FFF'

class CombinedEncoding extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	scalarEncoder = new BoundedScalarEncoder({
		w: 21, n: 100, min: 0, max: 1
	})

	dayOfWeekEncoder = new DayOfWeekCategoryEncoder({
		w: 11
	})
	dayOfMonthEncoder = new CyclicEncoder({
		w: 9, n: 20,
		min: 1, max: 31,
	})
	hourOfDayEncoder = new CyclicEncoder({
		w: 9, n: 20,
		min: 0, max: 23,
	})
	weekendEncoder = new WeekendEncoder({ w: 11 })

	// handle setting up when params are set/changed
	update() {
		this.encode()
		// this.orientD3()
		// this.renderOutputCells()
	}

	encode() {
    const { data: { time, value } } = this.props
		const encoding = []
		// scalar
		this.scalarEncoder.encode(value).forEach(bit => {
			encoding.push(bit ? 'cyan' : offColor)
		})
		// day of week
		this.dayOfWeekEncoder.encode(days[time.getDay()]).forEach(bit => {
			encoding.push(bit ? '#F3C300' : offColor)
		})
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
		console.log(encoding)
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

	orientD3() {
		// const {
		// 	diagramWidth, n
		// } = this.props
		// const {
		// 	min, max
		// } = this.encoder
		// // Create D3 scales
		// this.valToScreen = d3.scaleLinear()
		// 	.domain([min, max])
		// 	.range([sideGutter, diagramWidth - sideGutter])
		// this.bitsToOutputDisplay = d3.scaleLinear()
		// 	.domain([0, n])
		// 	.range([0 + sideGutter, diagramWidth - sideGutter])
	}

	renderOutputCells() {
		// const { diagramWidth, displayState, n } = this.props 
		// const g = this.root.select('.output-cells')
		// const buckets = this.encoder.n
		// const bucketSpread = (2 * Math.PI) / buckets
		// const transitioning = this._transition !== undefined
		// const maxCircleRadius = 20
		// const size = diagramWidth
		// const radius = size / 2.5
		// const circumference = 2 * Math.PI * radius
		// const center = { x: size / 2, y: size / 2 }

		// function treatCells(cell) {
		// 	// FIXME: standardize some styles for diagrams
		// 	cell.attr('class', 'bit')
		// 		.attr('fill', (d) => {
		// 			if (d.bit) return onColor
		// 			else return offColor
		// 		})
		// 		.attr('stroke', 'darkgrey')
		// 		.attr('stroke-width', 0.5)
		// 		.attr('fill-opacity', 1)
		// 		.attr('cx', (d) => {
		// 			return d.cx
		// 		})
		// 		.attr('cy', (d) => {
		// 			return d.cy
		// 		})
		// 		.attr('r', (d) => {
		// 			return d.radius
		// 		})
		// }

		// console.log(displayState)

		// let data = this.encoding.map((bit, i) => {
		// 	// Adding pi starts it at the top of the circle (180 into it)
		// 	let theta = i * bucketSpread + Math.PI
		// 	let out = { bit: bit }
		// 	let circleBuffer = 30
		// 	const circleRight = center.x + radius * Math.sin(theta)
		// 	const circleBottom = circleBuffer + center.y + radius * Math.cos(theta)
		// 	// Line To Circle
		// 	if (displayState === 'circle' && transitioning) {
		// 		out.cx = d3.scaleLinear().domain([0, 1]).range([
		// 			this.bitsToOutputDisplay(i),
		// 			circleRight,
		// 		])(this._transition)
		// 		out.cy = d3.scaleLinear().domain([0, 1]).range([
		// 			outputCellsTop,
		// 			circleBottom,
		// 		])(this._transition)
		// 		out.radius = d3.scaleLinear().domain([0, 1]).range([
		// 			Math.min(diagramWidth / n / 2, maxCircleRadius),
		// 			Math.min(circumference / n / 2, maxCircleRadius),
		// 		])(this._transition)
		// 	// Circle
		// 	} else if (displayState === 'circle') {
		// 		out.cx = circleRight
		// 		out.cy = circleBottom
		// 		out.radius = Math.min(circumference / n / 2, maxCircleRadius)
		// 	// Circle To Line
		// 	} else if (displayState === 'line' && transitioning) {
		// 		out.cx = d3.scaleLinear().domain([0, 1]).range([
		// 			circleRight,
		// 			this.bitsToOutputDisplay(i),
		// 		])(this._transition)
		// 		out.cy = d3.scaleLinear().domain([0, 1]).range([
		// 			circleBottom,
		// 			outputCellsTop,
		// 		])(this._transition)
		// 		out.radius = d3.scaleLinear().domain([0, 1]).range([
		// 			Math.min(circumference / n / 2, maxCircleRadius),
		// 			Math.min(diagramWidth / n / 2, maxCircleRadius),
		// 		])(this._transition)
		// 	// Line
		// 	} else if (displayState === 'line') {
		// 		out.cx = this.bitsToOutputDisplay(i)
		// 		out.cy = outputCellsTop
		// 		out.radius = Math.min(diagramWidth / n / 2, maxCircleRadius)
		// 	} else {
		// 		throw new Error('Unknown display format: ' + displayState)
		// 	}
		// 	return out
		// })


		// // Update
		// const circles = g.selectAll('circle').data(data)
		// treatCells(circles)

		// // Enter
		// const newCircles = circles.enter().append('circle')
		// treatCells(newCircles)

		// // Exit
		// circles.exit().remove()
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
