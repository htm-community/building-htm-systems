import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'

const diagramPadding = 10
const maxBars = 100

// FIXME: consolidate color handling
const winnerCutoffColor = 'purple'

function getGreenToRed(percent) {
	let r, g;
	percent = 100 - percent;
	r = percent < 50 ? 255 : Math.floor(255 - (percent * 2 - 100) * 255 / 100);
	g = percent > 50 ? 255 : Math.floor((percent * 2) * 255 / 100);
	return rgbToHex(r, g, 0);
}

/* From http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
function rgbToHex(r, g, b) {
	return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

class CompetitionStackRank extends React.Component {
	svgRef = React.createRef() // this will give you reference to HTML DOM element

	// setup any time params change
	componentDidUpdate(prevProps) {
		this.update()
	}

	// setup on initial mount
	componentDidMount() {
		// Sets up the d3 diagram on an SVG element.
		this.root = d3.select(`svg#${this.props.id}`)
			.attr('width', this.props.diagramWidth)
			.attr('height', this.props.diagramWidth / 4)
	}

	// handle setting up when params are set/changed
	update() {
		if (this.props.overlaps) {
			this.renderMinicolumns()
		}
	}

	renderMinicolumns() {
		const axisPadding = 20
		const diagramWidth = this.props.diagramWidth - diagramPadding * 2 - axisPadding
		const g = this.root.select('.minicolumns')
		const barWidth = diagramWidth / maxBars
		const chartHeight = diagramWidth / 4

		const maxOverlap = Math.max(...this.props.overlaps.map(o => o.length))
		const minOverlap = Math.min(...this.props.overlaps.map(o => o.length))
		const colorScale = d3.scaleLinear([minOverlap, maxOverlap], [0, 100])
		const barHeightScale = d3.scaleLinear([minOverlap, maxOverlap], [0, chartHeight])
		const axisScale = d3.scaleLinear([minOverlap, maxOverlap], [chartHeight, 0])

		const winners = this.props.winners

		function treatBars(cell) {
			cell.attr('class', 'bit')
				.attr('fill', (d) => {
					return '#' + getGreenToRed(colorScale(d.overlap))
				})
				.attr('stroke', 'grey')
				.attr('stroke-width', 0.5)
				.attr('x', (d, i) => {
					return axisPadding + i * barWidth
				})
				.attr('y', (d) => {
					return diagramPadding + chartHeight - barHeightScale(d.overlap)
				})
				.attr('width', barWidth)
				.attr('height', (d) => {
					return barHeightScale(d.overlap)
				})
				.attr('data-index', d => d.index)
		}

		const sortedOverlaps = this.props.overlaps.map((overlaps, mcIndex) => { 
			return {
				index: mcIndex,
				overlap: overlaps.length,
			}
		}).sort((a, b) => {
			if (a.overlap < b.overlap) return 1
			if (a.overlap > b.overlap) return -1
			if (a.index < b.index) return 1
			else return -1
		}).slice(0, maxBars)

		// Update
		const rects = g.selectAll('rect')
			.data(sortedOverlaps)
		treatBars(rects)

		// Enter
		const newRects = rects.enter().append('rect')
		treatBars(newRects)

		// Exit
		rects.exit().remove()

		const axis = d3.axisLeft(axisScale)
		this.root.select('.leftAxis')
			.attr("transform", `translate(20,${diagramPadding})`).call(axis)

		// Highlight selected minicolumn
		const selectedMinicolumn = this.props.selectedMinicolumn
		const selectedMcOverlap = this.props.overlaps[selectedMinicolumn].length
		const highlightedMc = sortedOverlaps.filter(overlap => overlap.index === selectedMinicolumn)[0]

		const highlight = this.root.select('#highlightedMinicolumn')

		if (highlightedMc !== undefined) {
			const x = axisPadding + sortedOverlaps.indexOf(highlightedMc) * barWidth
			const y = diagramPadding + chartHeight - barHeightScale(selectedMcOverlap)
			const barHeight = barHeightScale(selectedMcOverlap)
			highlight.attr('stroke', 'black')
				.attr('fill', 'none')
				.attr('stroke-width', 1)
				.attr('x', x)
				.attr('y', y)
				.attr('width', barWidth)
				.attr('height', barHeight)
		} else {
			highlight.attr('stroke', 'black')
				.attr('stroke', 'none')
		}

		const winnerCutoff = this.root.select('.winnerCutoff')
		const lineX = axisPadding + winners.length * barWidth
		winnerCutoff
			.attr('x1', lineX)
			.attr('y1', diagramPadding)
			.attr('x2', lineX)
			.attr('y2', chartHeight + diagramPadding)
			.attr('stroke-width', 2)
			.attr('stroke', winnerCutoffColor)
	}

	// Triggers consistently
	selectMinicolumn(e) {
		const selectedMinicolumn = Number(e.target.getAttribute('data-index'))
		this.props.onUpdate(selectedMinicolumn)
	}

	render() {

		return (
			<svg id={this.props.id}
				ref={this.svgRef}>

				<g className="stackRanking">
					<g className="minicolumns" onClick={e => this.selectMinicolumn(e)}></g>
					<g className="selectedMinicolumn">
						<rect id="highlightedMinicolumn"></rect>
					</g>
					<g className="leftAxis"></g>
					<line className="winnerCutoff"></line>
				</g>

			</svg>
		)
	}
}

CompetitionStackRank.propTypes = {
	id: PropTypes.string.isRequired,
}

export default CompetitionStackRank
