import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'
import { lineFunction, precisionRound } from './helpers'

const { ScalarEncoder } = simplehtm.encoders

const offColor = 'white'
const aColor = 'blue'
const bColor = 'yellow'
const bothColor = 'green'
const outputCellsTopMargin = 0
const sideGutter = 10
const cellHeight = 30

const debugStyle = {
	border: 'solid red 1px'
}

class ScalarOverlapDiagram extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	// encoding = undefined
	encoder = undefined
	encodingA = undefined
	encodingB = undefined
	valueA = this.props.valueA
	valueB = this.props.valueB

	// handle setting up when params are set/changed
	update() {
		this.resetEncoder()
		this.orientD3()
		this.renderOutputCells()
	}

	// setup any time params change
	componentDidUpdate(prevProps) {
		if(prevProps.valueA != this.props.valueA) {
			this.valueA = this.props.valueA
		}
		if(prevProps.valueB != this.props.valueB) {
			this.valueB = this.props.valueB
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
		// this.displayToBitRange = d3.scaleLinear()
		// 	.domain([0 + sideGutter, diagramWidth - sideGutter])
		// 	.range([0, n])
	}

	resetEncoder() {
		const {
			bounded, min, max, resolution, n, w
		} = this.props
		this.encoder = new (bounded ? BoundedScalarEncoder : ScalarEncoder)({
			min, max, resolution, w, n, bounded,
		})
		this.encodingA = this.encoder.encode(this.valueA)
		this.encodingB = this.encoder.encode(this.valueB)
	}

	renderOutputCells() {
		const { diagramWidth, n } = this.props

		const g = this.root.select('.output-cells')
		const cellWidth = Math.floor(diagramWidth / n)
		const bitsToOutputDisplay = this.bitsToOutputDisplay

		function treatCellRects(r) {
			// FIXME: standardize some styles for diagrams
			r.attr('class', 'bit')
				.attr('fill', (d) => {
					if (d.a > 0 && d.b > 0) return bothColor
					if (d.a > 0) return aColor
					if (d.b > 0) return bColor
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

		const dualEncoding = this.encodingA.map((v, i) => {
			return {a: v, b: this.encodingB[i]}
		}, this)

		// Update
		const rects = g.selectAll('rect').data(dualEncoding)

		treatCellRects(rects)
		// Enter
		const newRects = rects.enter().append('rect')
		treatCellRects(newRects)

		// Exit
		rects.exit().remove()

		this.drawBrackets()
	}

	drawBrackets() {
		let me = this
		this.drawBracket(this.valueA, 'valueA')
		this.drawBracket(this.valueB, 'valueB')

		this.root.selectAll('text')
			.call(d3.drag()
				.on('drag', function () {
					me.props.onUpdate({
						[this.id]: precisionRound(me.valToScreen.invert(d3.event.x), 1)
					})
				})
			)
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

	drawBracket(value, name) {
		const { diagramWidth, n } = this.props
		let valueScaleTopMargin = 30
		const cellWidth = Math.floor(diagramWidth / n)

		let encoder = this.encoder
		let g = this.root.select(`.${name}`)
		let leftPath = g.select('path.left')
		let rightPath = g.select('path.right')
		let label = g.select('text')

		let leftLineData = []
		let rightLineData = []
		let index = Math.floor(encoder.scale(value))
		let w = encoder.w
		let leftValue = encoder.reverseScale(index - (w/2))
		let rightValue = encoder.reverseScale(index + (w/2))
		let uiRange = [sideGutter, diagramWidth - sideGutter]

		let cx = sideGutter + index * cellWidth // center x
		let cy = cellHeight * 2.2 // center y

		label.attr('x', cx)
				.attr('y', cy + 15)
				.html(precisionRound(value, 1))
		
		leftLineData.push({x: cx, y: cy})
		rightLineData.push({x: cx, y: cy})
		let leftX = Math.max(this.valToScreen(leftValue), uiRange[0])
		let rightX = Math.min(this.valToScreen(rightValue), uiRange[1])
		// Intermediary points for curving
		leftLineData.push({
				x: cx - 10,
				y: cy - 10,
		})
		leftLineData.push({
				x: leftX,
				y: valueScaleTopMargin + 10
		})
		rightLineData.push({
				x: cx + 10,
				y: cy - 10,
		})
		rightLineData.push({
				x: rightX,
				y: valueScaleTopMargin + 10
		})

		// Point on value line
		leftLineData.push({
				x: leftX,
				y: valueScaleTopMargin
		})
		rightLineData.push({
				x: rightX,
				y: valueScaleTopMargin
		})
		leftPath
				.attr('d', lineFunction(leftLineData))
				.attr('stroke', 'black')
				.attr('fill', 'none')
		rightPath
				.attr('d', lineFunction(rightLineData))
				.attr('stroke', 'black')
				.attr('fill', 'none')
	}

	render() {
		return (
			<svg id={this.props.id}
				height={100}
				ref={this.svgRef}
				style={debugStyle}
			>

				<g className="output-cells"></g>

				<g className="valueA range">
					<path className="left"></path>
					<path className="right"></path>
					<text id="valueA"></text>
				</g>

				<g className="valueB range">
					<path className="left"></path>
					<path className="right"></path>
					<text id="valueB"></text>
				</g>

			</svg>
		)
	}
}

ScalarOverlapDiagram.propTypes = {
	diagramWidth: PropTypes.number.isRequired,
	id: PropTypes.string.isRequired,
	max: PropTypes.number.isRequired,
	min: PropTypes.number.isRequired,
	n: PropTypes.number.isRequired,
	onUpdate: PropTypes.func,
	valueA: PropTypes.number.isRequired,
	valueB: PropTypes.number.isRequired,
	w: PropTypes.number.isRequired,
}

export default ScalarOverlapDiagram
