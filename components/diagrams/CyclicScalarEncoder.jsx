import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'
import { precisionRound } from './helpers'

const { ScalarEncoder } = simplehtm.encoders

const offColor = 'white'
const onColor = 'skyblue'
const outputCellsTopMargin = 120
const sideGutter = 10
const topGutter = 40

const debugStyle = {
	border: 'solid red 1px'
}

class CyclicScalarEncoder extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	encoding = undefined
	encoder = undefined
	value = this.props.value

	// handle setting up when params are set/changed
	update() {
		this.resetEncoder(this.value)
		this.orientD3()
		this.renderNumberLine()
		this.renderValueMarker(this.value)
		this.renderOutputCells()
	}

	// setup any time params change
	componentDidUpdate(prevProps) {
		if(prevProps.value != this.props.value) {
			this.value = this.props.value
		}
		this.update()
	}
	// setup on initial mount
	componentDidMount() {
		// Sets up the d3 diagram on an SVG element.
		this.root = d3.select(`svg#${this.props.id}`)
			.attr('width', this.props.diagramWidth)
			.attr('height', this.props.diagramWidth)
		this.update()
	}

	orientD3() {
		const {
			diagramWidth, n
		} = this.props
		const {
			min, max
		} = this.encoder
		// Create D3 scales
		this.valToScreen = d3.scaleLinear()
			.domain([min, max])
			.range([sideGutter, diagramWidth - sideGutter])
		this.bitsToOutputDisplay = d3.scaleLinear()
			.domain([0, n])
			.range([0 + sideGutter, diagramWidth - sideGutter])
		// this.displayToBitRange = d3.scaleLinear()
		// 	.domain([0 + sideGutter, diagramWidth - sideGutter])
		// 	.range([0, n])
	}

	resetEncoder(value) {
		const {
			min, max, resolution, n, w
		} = this.props
		this.encoder = new ScalarEncoder({
			min, max, resolution, w, n
		})
		this.encoding = this.encoder.encode(value)
	}

	renderNumberLine() {
		this.root.select('.number-line')
			.attr('transform', `translate(0,${topGutter})`)
			.call(d3.axisBottom(this.valToScreen))
	}

	renderValueMarker(value) {
		const g = this.root.select('.value-marker')

		g.attr('transform', `translate(0,${topGutter})`)

		const markerWidth = 1
		const markerHeight = 20

		const x = this.valToScreen(value) - (markerWidth / 2)
		const y = 0 - (markerHeight / 2)

		const text = g.select('text')
		const mark = g.select('rect')

		// FIXME: standardize some styles for diagrams
		text.attr('x', x)
			.attr('y', y)
			.attr('font-family', 'sans-serif')
			.attr('font-size', '10pt')
			.text(value)

		mark.attr('stroke', 'red')
			.attr('stroke-width', 1.5)
			.attr('fill', 'none')
			.attr('width', markerWidth)
			.attr('height', markerHeight)
			.attr('x', x)
			.attr('y', y)
	}

	renderOutputCells() {
		const { diagramWidth, n } = this.props
		const g = this.root.select('.output-cells')
		const cellWidth = Math.floor(diagramWidth / n)
		const bitsToOutputDisplay = this.bitsToOutputDisplay

		function treatCells(cell) {
			// FIXME: standardize some styles for diagrams
			cell.attr('class', 'bit')
				.attr('fill', (d) => {
					if (d) return onColor
					else return offColor
				})
				.attr('stroke', 'darkgrey')
				.attr('stroke-width', 0.5)
				.attr('fill-opacity', 1)
				.attr('cx', function (d, i) {
					return bitsToOutputDisplay(i)
				})
				.attr('cy', outputCellsTopMargin)
				.attr('r', cellWidth)
		}

		// let center = {x: diagramWidth / 2, y: diagramWidth / 2}

		// let data = encoding.map((bit, i) => {
		// 	// Adding pi starts it at the top of the circle (180 into it)
		// 	let theta = i * bucketSpread + Math.PI
		// 	let out = {bit: bit}
		// 	let ratioToTop = size / 20
		// 	if (displayState === 'circle') {
		// 			out.cx = center.x + radius * Math.sin(theta)
		// 			out.cy = center.y + radius * Math.cos(theta)
		// 	// } else if (displayState === 'line-to-circle') {
		// 	// 		out.cx = d3.scaleLinear().domain([0, 1]).range([
		// 	// 				linearScale(i),
		// 	// 				center.x + radius * Math.sin(theta),
		// 	// 		])(this._transition)
		// 	// 		out.cy = d3.scaleLinear().domain([0, 1]).range([
		// 	// 				ratioToTop,
		// 	// 				center.y + radius * Math.cos(theta),
		// 	// 		])(this._transition)
		// 	} else if (displayState === 'line') {
		// 			out.cx = linearScale(i)
		// 			out.cy = ratioToTop
		// 	// } else if (displayState === 'circle-to-line') {
		// 	// 		out.cx = d3.scaleLinear().domain([0, 1]).range([
		// 	// 				center.x + radius * Math.sin(theta),
		// 	// 				linearScale(i),
		// 	// 		])(this._transition)
		// 	// 		out.cy = d3.scaleLinear().domain([0, 1]).range([
		// 	// 				center.y + radius * Math.cos(theta),
		// 	// 				ratioToTop,
		// 	// 		])(this._transition)
		// 	} else {
		// 			throw new Error('Unknown display format: ' + displayState)
		// 	}
		// 	return out
		// })


		// Update
		const circles = g.selectAll('circle').data(this.encoding)
		treatCells(circles)

		// Enter
		const newCircles = circles.enter().append('circle')
		treatCells(newCircles)

		// Exit
		circles.exit().remove()
	}

	getRangeFromBitIndex(i, encoder) {
		// const { bounded, w, resolution, min, max } = encoder
		// const v = encoder.reverseScale(i)
		// const radius = w * resolution / 2
		// let left = Math.max(min, v - radius)
		// let right = Math.min(max, v + radius)

		// // Keeps the bucket from changing size at min/max values
		// if (bounded) {
		// 	if (left < (min + radius)) left = min
		// 	if (right > (max - radius)) right = max
		// }
		// return [left, right]
	}

	handleOutputCellHover(e) {
	// 	const { diagramWidth, n } = this.props
	// 	const $hoverGroup = this.root.select('g.range')
	// 	const cellWidth = Math.floor(diagramWidth / n)

	// 	const lineX = e.pageX - this.svgRef.current.getBoundingClientRect().x
	// //	const lineX = e.pageX - sideGutter
	// 	const index = Math.floor(this.displayToBitRange(lineX))
	// 	const cx = this.bitsToOutputDisplay(index) + (cellWidth / 2)
	// 	const cy = outputCellsTopMargin
	// 	$hoverGroup.select('g.range circle')
	// 		.attr('r', cellWidth / 2)
	// 		.attr('cx', cx)
	// 		.attr('cy', cy)
	// 		.attr('fill', 'royalblue')

	// 	const valueRange = this.getRangeFromBitIndex(index, this.encoder)
	// 	const leftValueBound = Math.max(this.encoder.min, valueRange[0]),
	// 		rightValueBound = Math.min(this.encoder.max, valueRange[1])
	// 	const leftLineData = []
	// 	const rightLineData = []
	// 	leftLineData.push({ x: cx, y: cy })
	// 	rightLineData.push({ x: cx, y: cy })
	// 	const nearX = this.valToScreen(leftValueBound)
	// 	const farX = this.valToScreen(rightValueBound)
	// 	// Intermediary points for curving
	// 	leftLineData.push({
	// 		x: cx - 10,
	// 		y: cy - 20,
	// 	})
	// 	leftLineData.push({
	// 		x: nearX,
	// 		y: topGutter + 20
	// 	})
	// 	rightLineData.push({
	// 		x: cx + 10,
	// 		y: cy - 20,
	// 	})
	// 	rightLineData.push({
	// 		x: farX,
	// 		y: topGutter + 20
	// 	})

	// 	// Point on value line
	// 	leftLineData.push({
	// 		x: nearX,
	// 		y: topGutter
	// 	})
	// 	rightLineData.push({
	// 		x: farX,
	// 		y: topGutter
	// 	})
	// 	$hoverGroup.select('path.left')
	// 		.attr('d', lineFunction(leftLineData))
	// 		.attr('stroke', 'black')
	// 		.attr('fill', 'none')
	// 	$hoverGroup.select('path.right')
	// 		.attr('d', lineFunction(rightLineData))
	// 		.attr('stroke', 'black')
	// 		.attr('fill', 'none')
	// 	$hoverGroup.attr('visibility', 'visible')
	}

	// This is the only thing that could change internal state coming
	// from inside this child.
	handleNumberLineHover(e) {
		const { min, max } = this.encoder
		const lineX = e.pageX - this.svgRef.current.getBoundingClientRect().x
		//const lineX = e.pageX - sideGutter
		let value = this.value = precisionRound(this.valToScreen.invert(lineX), 1)
		// Only update if in bounds.
		if (min <= value && value <= max) {
			// If there's an onUpdate in the props, we'll assume this state
			// is managed by the parent and pass it along.
			if (this.props.onUpdate) {
				this.props.onUpdate(value)
			} else {
				this.update()
			}
		}
	}
				
	render() {
		return (
			<svg id={this.props.id}
				ref={this.svgRef}
				style={debugStyle}
				onMouseMove={
					(e) => e.target.className.animVal === 'bit' ? this.handleOutputCellHover(e) : this.handleNumberLineHover(e)
				}>

				<g className="number-line"></g>

				<g className="value-marker">
					<text></text>
					<rect></rect>
				</g>

				<g className="output-cells"></g>

				{/* <g className="bits">
					<text className="value-display"></text>
					<text className="name-label">
							<tspan dx="0.5em">cyclic</tspan>
							<tspan dx="-3.25em" dy="1em">encoding</tspan>
					</text>
				</g> */}
				
			</svg>
		)
	}
}

CyclicScalarEncoder.propTypes = {
	id: PropTypes.string.isRequired,
	value: PropTypes.number,
	onUpdate: PropTypes.func,
	min: PropTypes.number,
	max: PropTypes.number,
	resolution: PropTypes.number,
	w: PropTypes.number.isRequired,
	n: PropTypes.number.isRequired,
	diagramWidth: PropTypes.number.isRequired,
}

export default CyclicScalarEncoder
