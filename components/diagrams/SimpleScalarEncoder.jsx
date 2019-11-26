import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'
import { lineFunction, precisionRound } from './helpers'

const { BoundedScalarEncoder, ScalarEncoder } = simplehtm.encoders

const offColor = 'white'
const onColor = 'skyblue'
const outputCellsTopMargin = 120
const sideGutter = 10
const topGutter = 40

class SimpleScalarEncoder extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	encoding = undefined
	encoder = undefined
	value = this.props.value || 0

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
		this.displayToBitRange = d3.scaleLinear()
			.domain([0 + sideGutter, diagramWidth - sideGutter])
			.range([0, n])
	}

	resetEncoder(value) {
		const {
			bounded, min, max, resolution, n, w
		} = this.props
		this.encoder = new (bounded ? BoundedScalarEncoder : ScalarEncoder)({
			min, max, resolution, w, n, bounded,
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
		const markerHeight = 16

    const x = this.valToScreen(value) - (markerWidth / 2)
    const centeredX = x - 10
		const y = 0 - (markerHeight / 2)

		const text = g.select('text')
		const mark = g.select('rect')

		// FIXME: standardize some styles for diagrams
		text.attr('x', centeredX)
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
			.attr('y', y + 6)
	}

	renderOutputCells() {
		const { diagramWidth, n } = this.props

		const g = this.root.select('.output-cells')
		const cellWidth = Math.floor(diagramWidth / n)
		const cellHeight = 30
		const bitsToOutputDisplay = this.bitsToOutputDisplay

		function treatCellRects(r) {
			// FIXME: standardize some styles for diagrams
			r.attr('class', 'bit')
				.attr('fill', (d) => {
					if (d) return onColor
					else return offColor
				})
				.attr('stroke', 'darkgrey')
				.attr('stroke-width', 0.5)
				.attr('fill-opacity', 1)
				.attr('x', function (d, i) {
					return bitsToOutputDisplay(i)
				})
				.attr('y', outputCellsTopMargin)
				.attr('width', cellWidth)
				.attr('height', cellHeight)
		}

		// Update
		const rects = g.selectAll('rect').data(this.encoding)

		treatCellRects(rects)
		// Enter
		const newRects = rects.enter().append('rect')
		treatCellRects(newRects)

		// Exit
		rects.exit().remove()
	}

	getRangeFromBitIndex(i, encoder) {
		const { bounded, w, resolution, min, max } = encoder
		const v = encoder.reverseScale(i)
		const radius = w * resolution / 2
		let left = Math.max(min, v - radius)
		let right = Math.min(max, v + radius)

		// Keeps the bucket from changing size at min/max values
		if (bounded) {
			if (left < (min + radius)) left = min
			if (right > (max - radius)) right = max
		}
		return [left, right]
	}

	handleOutputCellHover(e) {
		const { diagramWidth, n } = this.props
		const $hoverGroup = this.root.select('g.range')
		const cellWidth = Math.floor(diagramWidth / n)

		const lineX = e.pageX - this.svgRef.current.getBoundingClientRect().x
	//	const lineX = e.pageX - sideGutter
		const index = Math.floor(this.displayToBitRange(lineX))
		const cx = this.bitsToOutputDisplay(index) + (cellWidth / 2)
		const cy = outputCellsTopMargin
		$hoverGroup.select('g.range circle')
			.attr('r', cellWidth / 2)
			.attr('cx', cx)
			.attr('cy', cy)
			.attr('fill', 'royalblue')

		const valueRange = this.getRangeFromBitIndex(index, this.encoder)
		const leftValueBound = Math.max(this.encoder.min, valueRange[0]),
			rightValueBound = Math.min(this.encoder.max, valueRange[1])
		const leftLineData = []
		const rightLineData = []
		leftLineData.push({ x: cx, y: cy })
		rightLineData.push({ x: cx, y: cy })
		const nearX = this.valToScreen(leftValueBound)
		const farX = this.valToScreen(rightValueBound)
		// Intermediary points for curving
		leftLineData.push({
			x: cx - 10,
			y: cy - 20,
		})
		leftLineData.push({
			x: nearX,
			y: topGutter + 20
		})
		rightLineData.push({
			x: cx + 10,
			y: cy - 20,
		})
		rightLineData.push({
			x: farX,
			y: topGutter + 20
		})

		// Point on value line
		leftLineData.push({
			x: nearX,
			y: topGutter
		})
		rightLineData.push({
			x: farX,
			y: topGutter
		})
		$hoverGroup.select('path.left')
			.attr('d', lineFunction(leftLineData))
			.attr('stroke', 'black')
			.attr('fill', 'none')
		$hoverGroup.select('path.right')
			.attr('d', lineFunction(rightLineData))
			.attr('stroke', 'black')
			.attr('fill', 'none')
		$hoverGroup.attr('visibility', 'visible')
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
				onMouseMove={
					(e) => e.target.className.animVal === 'bit' ? this.handleOutputCellHover(e) : this.handleNumberLineHover(e)
				}>

				<text x="10" y="20" fontSize="10pt">scalar value</text>
				<g className="number-line"></g>

				<g className="value-marker">
					<text></text>
					<rect></rect>
				</g>

				<text x="10" y="80" fontSize="10pt">encoding</text>
				<g className="output-cells"></g>

				<g className="range" visibility="hidden">
					<circle></circle>
					<path className="left"></path>
					<path className="right"></path>
				</g>
			</svg>
		)
	}
}

SimpleScalarEncoder.propTypes = {
	bounded: PropTypes.bool,
	value: PropTypes.number,
	onUpdate: PropTypes.func,
	min: PropTypes.number,
	max: PropTypes.number,
	resolution: PropTypes.number,
	id: PropTypes.string.isRequired,
	w: PropTypes.number.isRequired,
	n: PropTypes.number.isRequired,
	diagramWidth: PropTypes.number.isRequired,
}

export default SimpleScalarEncoder
