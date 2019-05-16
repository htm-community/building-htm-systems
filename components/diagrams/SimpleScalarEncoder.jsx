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

const debugStyle = {
  border: 'solid red 1px'
}

class SimpleScalarEncoder extends React.Component {
  encoding = undefined; // current encoding
  encoder = undefined; // current encode used to encode value
  value = undefined; // current value

  // Use the internal encoder to turn bits into
  encode = (value) => this.encoder.encode(value)

  // handle setting up when params are set/changed
  update = () => {
    this.renderNumberLine()
    this.renderOutputCells()
    this.renderValueMarker()
  }

  // setup any time params change
  componentDidUpdate() {
    // console.log('BasicScalarEncoder.componentDidUpdate')
    this.update()
  }

  // setup on initial mount
  componentDidMount() {
    // console.log('BasicScalarEncoder.componentDidMount')
    this.value = this.props.value

    const {
      bounded, diagramWidth, id, min, max, n, w
    } = this.props

    this.encoder = new (bounded ? BoundedScalarEncoder : ScalarEncoder)({
      min, max, w, n, bounded,
    })
    this.encoding = this.encode(this.value)

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

    // Sets up the d3 diagram
    this.root = d3.select(`#${id}`)
      .attr('width', diagramWidth)

    this.update()
  }

  renderNumberLine = () => {
    this.root.select('.number-line').attr('transform', `translate(0,${topGutter})`).call(d3.axisBottom(this.valToScreen))
  }

  renderValueMarker = () => {
    const g = this.root.select('.value-marker')

    g.attr('transform', `translate(0,${topGutter})`)

    const markerWidth = 1
    const markerHeight = 20

    const x = this.valToScreen(this.props.value) - (markerWidth / 2)
    const y = 0 - (markerHeight / 2)

    const text = g.select('text')
    const mark = g.select('rect')

    // FIXME: standardize some styles for diagrams
    text.attr('x', x)
      .attr('y', y)
      .attr('font-family', 'sans-serif')
      .attr('font-size', '10pt')
      .text(this.props.value)

    mark.attr('stroke', 'red')
      .attr('stroke-width', 1.5)
      .attr('fill', 'none')
      .attr('width', markerWidth)
      .attr('height', markerHeight)
      .attr('x', x)
      .attr('y', y)
  }

  renderOutputCells = () => {
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

  getRangeFromBitIndex = (i, encoder) => {
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

  handleOutputCellHover = (e) => {
    const { diagramWidth, n } = this.props
    const $hoverGroup = this.root.select('g.range')
    const cellWidth = Math.floor(diagramWidth / n)

    const lineX = e.pageX - sideGutter
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

  handleNumberLineHover = (e) => {
    const { min, max } = this.props
    const lineX = e.pageX - sideGutter
    let value = precisionRound(this.valToScreen.invert(lineX), 1)

    if (value < min || value > max) {
      return
    } else {
      this.encoding = this.encoder.encode(value)
      this.renderValueMarker()
      this.renderOutputCells()
    }
    this.props.onUpdate(value)
  }

  render() {
    return (
      <svg id={this.props.id}
        style={debugStyle}
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
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  w: PropTypes.number.isRequired,
  n: PropTypes.number.isRequired,
  diagramWidth: PropTypes.number.isRequired,
}

export default SimpleScalarEncoder
