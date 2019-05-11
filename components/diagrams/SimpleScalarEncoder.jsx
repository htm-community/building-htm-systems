import React from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'

const ScalarEncoder = simplehtm.encoders.ScalarEncoder
const BoundedScalarEncoder = simplehtm.encoders.BoundedScalarEncoder

const onColor = 'skyblue'
const offColor = 'white'

const sideGutter = 10
const topGutter = 40
const outputCellsTopMargin = 120

let lineFunction = d3.line()
	.x(function(d) { return d.x })
	.y(function(d) { return d.y })
	.curve(d3.curveCatmullRom.alpha(0.5))

// FIXME: Add a utils library.
function precisionRound(number, precision) {
	let factor = Math.pow(10, precision)
	return Math.round(number * factor) / factor
}

class SimpleScalarEncoder extends React.Component {

	constructor(props) {
		super(props)

		this.id = props.id
		this.bounded = props.bounded
		this.min = props.min
		this.max = props.max
		this.val = props.val

		this.n = props.n || 10
		this.w = props.w || 100

		this.diagramWidth = props.diagramWidth

		let EncoderClass = ScalarEncoder
		if (this.bounded) {
			EncoderClass = BoundedScalarEncoder
		}
    
		this.encoder = new EncoderClass({
			min: this.min, max: this.max,
			w: this.w, n: this.n,
			bounded: false,
		})

		this.encoding = this.encode(this.val)
	}

	stateChanged() {
		this.renderValueMarker()
		this.renderOutputCells()
	}

	// Use the internal encoder to turn bits into
	encode(value) {
		let encoding = this.encoder.encode(value)
		console.log(`Encoding ${value} into ${encoding}`)
		return encoding
	}

  update = () => {
  	// Create D3 scales
  	this.valToScreen = d3.scaleLinear()
  		.domain([this.min, this.max])
  		.range([sideGutter, this.diagramWidth - sideGutter])
  	this.screenToVal = d3.scaleLinear()
  		.domain([sideGutter, this.diagramWidth - sideGutter])
  		.range([this.min, this.max])
  	this.bitsToOutputDisplay = d3.scaleLinear()
  		.domain([0, this.n])
  		.range([0 + sideGutter, this.diagramWidth - sideGutter])
  	this.displayToBitRange = d3.scaleLinear()
  		.domain([0 + sideGutter, this.diagramWidth - sideGutter])
  		.range([0, this.n])
  	// Sets up the d3 diagram
  	this.root = d3.select(`#${this.id}`)
  		.attr('width', this.diagramWidth)
  	this.renderNumberLine()
  	this.renderOutputCells()
  	this.renderValueMarker()
  }

  // https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidUpdate() {
  	this.update()
  }

  componentDidMount() {
  	this.update()
  }
  renderNumberLine() {
  	let g = this.root.select('.number-line')
  	let xAxis = d3.axisBottom(this.valToScreen)
  	g.attr('transform', `translate(0,${topGutter})`).call(xAxis)
  }

  renderValueMarker() {
  	let value = this.val
  	let g = this.root.select('.value-marker')
  	g.attr('transform', `translate(0,${topGutter})`)

  	let markerWidth = 1
  	let markerHeight = 20

  	let x = this.valToScreen(value) - (markerWidth / 2)
  	let y = 0 - (markerHeight / 2)

  	let text = g.select('text')
  	let mark = g.select('rect')

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
  	let g = this.root.select('.output-cells')
  	let bits = this.n
  	let width = this.diagramWidth
  	let cellWidth = Math.floor(width / bits)
  	let cellHeight = 30
  	let bitsToOutputDisplay = this.bitsToOutputDisplay

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
  			.attr('x', function(d, i) {
  				return bitsToOutputDisplay(i)
  			})
  			.attr('y', outputCellsTopMargin)
  			.attr('width', cellWidth)
  			.attr('height', cellHeight)
  	}

  	// Update
  	let rects = g.selectAll('rect').data(this.encoding)
  	treatCellRects(rects)
  	// Enter
  	let newRects = rects.enter().append('rect')
  	treatCellRects(newRects)
  	// Exit
  	rects.exit().remove()
  }

  handleSvgMouseOver(e) {
  	if (e.target.className.animVal === 'bit') {
  		this.handleOutputCellHover(e)
  	} else {
  		this.handleNumberLineHover(e)
  	}
  }

  getRangeFromBitIndex(i, encoder) {
  	let v = encoder.reverseScale(i),
  		w = encoder.w,
  		res = encoder.resolution,
  		min = encoder.min,
  		max = encoder.max,
  		radius = w * res / 2,
  		left = Math.max(min, v - radius),
  		right = Math.min(max, v + radius)
  	// Keeps the bucket from changing size at min/max values
  	if (encoder.bounded) {
  		if (left < (min + radius)) left = min
  		if (right > (max - radius)) right = max
  	}
  	return [left, right]
  }

  handleOutputCellHover(e) {
  	let $hoverGroup = this.root.select('g.range')
  	let cellWidth = Math.floor(this.diagramWidth / this.n)
    
  	let lineX = e.pageX - sideGutter
  	let index = Math.floor(this.displayToBitRange(lineX))
  	console.log(index)
  	let cx = this.bitsToOutputDisplay(index) + (cellWidth / 2)
  	let cy = outputCellsTopMargin
  	$hoverGroup.select('g.range circle')
  		.attr('r', cellWidth / 2)
  		.attr('cx', cx)
  		.attr('cy', cy)
  		.attr('fill', 'royalblue')

  	let encoder = this.encoder
  	let valueRange = this.getRangeFromBitIndex(index, encoder)
  	let leftValueBound = Math.max(encoder.min, valueRange[0]),
  		rightValueBound = Math.min(encoder.max, valueRange[1])
  	let leftLineData = []
  	let rightLineData = []
  	leftLineData.push({x: cx, y: cy})
  	rightLineData.push({x: cx, y: cy})
  	let nearX = this.valToScreen(leftValueBound)
  	let farX = this.valToScreen(rightValueBound)
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

  handleNumberLineHover(e) {
  	let lineX = e.pageX - sideGutter
  	let value = this.screenToVal(lineX)
  	value = precisionRound(value, 1)
  	this.val = value
  	if (value < this.min || value > this.max) {
  		return
  	} else {
  		this.encoding = this.encoder.encode(value)
  		this.stateChanged()
  	}
  }

  render() {
  	let debugStyle = {
  		border: 'solid red 1px'
  	}
  	return (
  		<svg id={this.id} 
  			style={debugStyle} 
  			onMouseMove={this.handleSvgMouseOver.bind(this)}>

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
	bounded: PropTypes.bool.isRequired,
	min: PropTypes.number.isRequired,
	max: PropTypes.number.isRequired,
	val: PropTypes.number.isRequired,
	id: PropTypes.string.isRequired,
	w: PropTypes.number.isRequired,
	n: PropTypes.number.isRequired,
	diagramWidth: PropTypes.number.isRequired,
}

export default SimpleScalarEncoder
