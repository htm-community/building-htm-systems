import React from 'react'
import * as d3 from 'd3'

const offColor = 'white'
const sideGutter = 10

class SimpleCyclicEncoder extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	// handle setting up when params are set/changed
	update() {
		if (this.props.encoding) {
			this.orientD3()
			this.renderOutputCells()
			this.renderLabel()
		}
	}

	// setup any time params change
	componentDidUpdate() {
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
		this.bitsToOutputDisplay = d3.scaleLinear()
			.domain([0, this.props.encoding.length])
			.range([0 + sideGutter, this.props.diagramWidth - sideGutter])
	}

	renderOutputCells() {
		const diagramWidth = this.props.diagramWidth
		const g = this.root.select('.output-cells')
		const buckets = this.props.encoding.length
		const bucketSpread = (2 * Math.PI) / buckets
		const maxCircleRadius = 20
		const size = diagramWidth
		const radius = size / 2.5
		const circumference = 2 * Math.PI * radius
		const center = { x: size / 2, y: size / 2 }
		const color = this.props.color

		function treatCells(cell) {
			cell.attr('class', 'bit')
				.attr('fill', (d) => {
					if (d.bit) return color
					else return offColor
				})
				.attr('stroke', 'black')
				.attr('stroke-width', 1)
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

		let data = this.props.encoding.map((bit, i) => {
			// Adding pi starts it at the top of the circle (180 into it)
			let theta = i * bucketSpread + Math.PI
			let out = { bit: bit }
			const circleRight = center.x + radius * Math.sin(theta)
			const circleBottom = center.y + radius * Math.cos(theta)
			out.cx = circleRight
			out.cy = circleBottom
			out.radius = Math.min(circumference / buckets / 2, maxCircleRadius)
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

	renderLabel() {
		const borderWidth = 2
		const labelRect = this.root.select('.label rect')
		const textWrapper = this.root.select('.label foreignObject')
		const labelText = this.root.select('.label foreignObject p')

		const labelWidth = this.props.diagramWidth * .6
		const labelHeight = this.props.diagramWidth / 3
		const x = this.props.diagramWidth * .4 - borderWidth * 2
		const y = this.props.diagramWidth / 3

		labelRect
			.attr('x', x)
			.attr('y', y)
			.attr('width', labelWidth)
			.attr('height', labelHeight)
			.attr('stroke', 'black')
			.attr('stroke-width', 2)
			.attr('fill', 'white')
			.attr('fill-opacity', 0.9)

		textWrapper
			.attr('x', x)
			.attr('y', y)
			.attr('width', labelWidth)
			.attr('height', labelHeight)

		labelText.text(this.props.label)
	}

	render() {
		return (
			<svg id={this.props.id}
				ref={this.svgRef}
			>

				<g className="output-cells"></g>
				<g className="label">
					<rect></rect>
					<foreignObject className="label">
						<p xmlns="http://www.w3.org/1999/xhtml" style={{
							padding: "0px 14px",
							fontSize: "22pt",
							textAlign: "center",
						}}></p>
					</foreignObject>
				</g>

			</svg>
		)
	}
}

export default SimpleCyclicEncoder
