import React from 'react'
import * as d3 from 'd3'
import simplehtm from 'simplehtm'
import { precisionRound } from './helpers'

const { CategoryEncoder } = simplehtm.encoders

const offColor = 'white'
const onColor = 'skyblue'
const outputCellsTopMargin = 120
const sideGutter = 10
const topGutter = 40

class DiscreteEncodingDiagram extends React.Component {
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
			.domain([min+1, max])
			.range([sideGutter, diagramWidth - sideGutter])
		this.bitsToOutputDisplay = d3.scaleLinear()
			.domain([0, n])
			.range([0 + sideGutter, diagramWidth - sideGutter])
		this.displayToBitRange = d3.scaleLinear()
			.domain([0 + sideGutter, diagramWidth - sideGutter])
			.range([0, n])
	}

  resetEncoder(value) {
    const categoryLength = this.props.categoryLength
    const w = Math.floor(this.props.n / categoryLength)
		this.encoder = new CategoryEncoder({
      w: w,
      categories: [...Array(categoryLength).keys()]
    })
		this.encoding = this.encoder.encode(Math.round(this.value - 1))
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
					(e) => this.handleNumberLineHover(e)
				}>

				<text x="10" y="20" fontSize="10pt">scalar value</text>
				<g className="number-line"></g>

				<g className="value-marker">
					<text></text>
					<rect></rect>
				</g>

				<text x="10" y="80" fontSize="10pt">encoding</text>
				<g className="output-cells"></g>

			</svg>
		)
	}
}

export default DiscreteEncodingDiagram
