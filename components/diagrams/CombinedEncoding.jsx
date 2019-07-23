import React from 'react'
import * as d3 from 'd3'

const offColor = '#FFF'
const combinedColor = '#BBB'

const diagramPadding = 40

class CombinedEncoding extends React.Component {
	params = this.props.params
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	// handle setting up when params are set/changed
	update() {
		if (this.props.scalarEncoding) {
			this.createData()
			this.renderOutputCells()
		}
	}

	createData() {
		const encoding = []
		const jointColor = this.props.combined == 'combined' ? combinedColor : undefined;
		this.props.scalarEncoding.forEach(bit => {
			encoding.push(bit ? jointColor || this.props.scalarColor : offColor)
		})
		this.props.dayOfWeekEncoding.forEach(bit => {
			encoding.push(bit ? jointColor || this.props.dayOfWeekColor : offColor)
		})
		this.props.dayOfMonthEncoding.forEach(bit => {
			encoding.push(bit ? jointColor || this.props.dayOfMonthColor : offColor)
		})
		this.props.hourOfDayEncoding.forEach(bit => {
			encoding.push(bit ? jointColor || this.props.hourOfDayColor : offColor)
		})
		this.props.weekendEncoding.forEach(bit => {
			encoding.push(bit ? jointColor || this.props.weekendColor : offColor)
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

export default CombinedEncoding
