import React from 'react'
import * as d3 from 'd3'

const chartPerc = 0.85
const offColor = 'white'


class StreamingScalarDiagram extends React.Component {
	params = this.props.params
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	allData = []

	// handle setting up when params are set/changed
	update() {
		if (this.props.encoding) {
			this.renderLineChart()
			this.renderEncoding()
		}
	}

	// setup any time params change
	componentDidUpdate() {
		if (this.props.value) {
			this.allData.push(this.props.value)
			if (this.allData.length > this.props.windowSize) {
				this.allData.shift()
			}
		}
		this.update()
	}

	// setup on initial mount
	componentDidMount() {
		// Sets up the d3 diagram on an SVG element.
		this.root = d3.select(`svg#${this.props.id}`)
			.attr('width', this.props.diagramWidth)
			.attr('height', this.props.diagramHeight)
	}

	renderEncoding() {
		const width = this.props.diagramWidth
		const height = this.props.diagramHeight
		const encoding = this.props.encoding
		const onColor = this.props.cellColor
		let bitsToOutputDisplay = d3.scaleLinear()
				.domain([0, encoding.length])
				// the -2 is to account for the left and right border widths
				.range([0, width -2])
		let cellWidth = Math.floor(width / encoding.length)
		const cellHeight = height * (1 - chartPerc)
		let g = this.root.select('g.encoding')
		g.attr('transform', 'translate(0, ' + height * chartPerc + ')')
		function treatCellRects(r) {
				r.attr('class', 'bit')
						.attr('fill', (d) => {
								if (d) return onColor
								else return offColor
						})
						.attr('stroke', 'darkgrey')
						.attr('stroke-width', 0.5)
						.attr('fill-opacity', 1)
						.attr('x', function(d, i) {
								return bitsToOutputDisplay(i)
						})
						.attr('y', 0)
						.attr('width', cellWidth)
						.attr('height', cellHeight)
		}

		// Update
		let rects = g.selectAll('rect.bit').data(encoding)
		treatCellRects(rects)

		// Enter
		let newRects = rects.enter().append('rect')
		treatCellRects(newRects)

		// Exit
		rects.exit().remove()
	}

	renderLineChart() {
		const width = this.props.diagramWidth
		const windowSize = this.props.windowSize
		const chartHeight = this.props.diagramHeight * chartPerc
		const chartPadding = 30
		let path = this.root.select('path#plot')
		let dot = this.root.select('circle#value-dot')
		const scaleX = d3.scaleLinear().domain([0, windowSize])
			.range([0, width])
		const scaleY = d3.scaleLinear().domain([1, -1])
			.range([chartPadding, chartHeight - chartPadding])
		const lineFunction = d3.line()
			.x(function (d, i) {
				return scaleX(i)
			})
			.y(function (d, i) {
				return scaleY(d)
			})
			.curve(d3.curveCatmullRom.alpha(0.01))
		const dataLength = this.allData.length
		if (dataLength) {
		// Add first and last points so we can fill the space beneath the curve
		let line = lineFunction(this.allData)
		line = line.replace('M0', `M0,${chartHeight}L0`) + `L${scaleX(dataLength-1)},${chartHeight}`
		path.attr('d', line)
			.attr('stroke', 'none')
			.attr('fill', this.props.color)
		}
		dot.attr('cx', scaleX(this.allData.length - 1))
			.attr('cy', scaleY(this.props.value))
			.attr('r', 3)
			.attr('fill', 'red')
			.attr('stroke', 'red')
	}

	render() {
		return (
			<svg id={this.props.id}
			ref={this.svgRef}>

				<g className="chart">
						<path id="plot"></path>
						{/* <rect id="index"></rect> */}
						<circle id="value-dot"></circle>
						{/* <text id="label"></text> */}
				</g>

				<g className="encoding"></g>

			</svg>
		)
	}
}

export default StreamingScalarDiagram
