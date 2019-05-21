import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'
import { precisionRound } from './helpers'

const { CyclicEncoder } = simplehtm.encoders

const offColor = 'white'
const onColor = 'skyblue'
// const outputCellsTopMargin = 120
const sideGutter = 10
const numberLineY = 40
const outputCellsTop = 100

const debugStyle = {
	border: 'solid red 1px'
}

class CyclicScalarEncoder extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	encoding = undefined
	encoder = undefined
	value = this.props.value
	animationHandle = undefined
	
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
		const me = this
		const speed = 100
		if (prevProps.value != this.props.value) {
			this.value = this.props.value
			this.update()
		} else if (prevProps.displayState != this.props.displayState) {
			// create animation handle
			const cuts = 16
			let count = 0
			this._transition = 0
			this.animationHandle = setInterval(() => {
				me._transition = count / cuts
				if (count++ >= cuts) {
						clearInterval(me.animationHandle)
						delete me._transition
				}
				me.update()
			}, speed)
		}
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
		this.encoder = new CyclicEncoder({
			min, max, resolution, w, n
		})
		this.encoding = this.encoder.encode(value)
	}

	renderNumberLine() {
		this.root.select('.number-line')
			.attr('transform', `translate(0,${numberLineY})`)
			.call(d3.axisBottom(this.valToScreen))
	}

	renderValueMarker(value) {
		const g = this.root.select('.value-marker')

		g.attr('transform', `translate(0,${numberLineY})`)

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
		const { diagramWidth, displayState, n } = this.props 
		const g = this.root.select('.output-cells')
		const buckets = this.encoder.n
		const bucketSpread = (2 * Math.PI) / buckets
		const transitioning = this._transition !== undefined
		const maxCircleRadius = 20
		const size = diagramWidth
		const radius = size / 2.5
		const circumference = 2 * Math.PI * radius
		const center = { x: size / 2, y: size / 2 }

		function treatCells(cell) {
			// FIXME: standardize some styles for diagrams
			cell.attr('class', 'bit')
				.attr('fill', (d) => {
					if (d.bit) return onColor
					else return offColor
				})
				.attr('stroke', 'darkgrey')
				.attr('stroke-width', 0.5)
				.attr('fill-opacity', 1)
				.attr('cx', (d) => {
					return d.cx
				})
				.attr('cy', (d) => {
					return d.cy
				})
				.attr('r', (d) => {
					return d.radius
				})
		}

		console.log(displayState)

		let data = this.encoding.map((bit, i) => {
			// Adding pi starts it at the top of the circle (180 into it)
			let theta = i * bucketSpread + Math.PI
			let out = { bit: bit }
			let circleBuffer = 30
			const circleRight = center.x + radius * Math.sin(theta)
			const circleBottom = circleBuffer + center.y + radius * Math.cos(theta)
			// Line To Circle
			if (displayState === 'circle' && transitioning) {
				out.cx = d3.scaleLinear().domain([0, 1]).range([
					this.bitsToOutputDisplay(i),
					circleRight,
				])(this._transition)
				out.cy = d3.scaleLinear().domain([0, 1]).range([
					outputCellsTop,
					circleBottom,
				])(this._transition)
				out.radius = d3.scaleLinear().domain([0, 1]).range([
					Math.min(diagramWidth / n / 2, maxCircleRadius),
					Math.min(circumference / n / 2, maxCircleRadius),
				])(this._transition)
			// Circle
			} else if (displayState === 'circle') {
				out.cx = circleRight
				out.cy = circleBottom
				out.radius = Math.min(circumference / n / 2, maxCircleRadius)
			// Circle To Line
			} else if (displayState === 'line' && transitioning) {
				out.cx = d3.scaleLinear().domain([0, 1]).range([
					circleRight,
					this.bitsToOutputDisplay(i),
				])(this._transition)
				out.cy = d3.scaleLinear().domain([0, 1]).range([
					circleBottom,
					outputCellsTop,
				])(this._transition)
				out.radius = d3.scaleLinear().domain([0, 1]).range([
					Math.min(circumference / n / 2, maxCircleRadius),
					Math.min(diagramWidth / n / 2, maxCircleRadius),
				])(this._transition)
			// Line
			} else if (displayState === 'line') {
				out.cx = this.bitsToOutputDisplay(i)
				out.cy = outputCellsTop
				out.radius = Math.min(diagramWidth / n / 2, maxCircleRadius)
			} else {
				throw new Error('Unknown display format: ' + displayState)
			}
			return out
		})


		// Update
		const circles = g.selectAll('circle').data(data)
		treatCells(circles)

		// Enter
		const newCircles = circles.enter().append('circle')
		treatCells(newCircles)

		// Exit
		circles.exit().remove()
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
					(e) => this.handleNumberLineHover(e)
				}>

				<g className="number-line"></g>

				<g className="value-marker">
					<text></text>
					<rect></rect>
				</g>

				<g className="output-cells"></g>
				
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
