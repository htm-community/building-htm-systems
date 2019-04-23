import * as d3 from "d3"
import PropTypes from 'prop-types'
import simplehtm from 'simplehtm'

const ScalarEncoder = simplehtm.encoders.ScalarEncoder

const onColor = 'skyblue'
const offColor = 'white'

const gutter = 10

class SimpleScalarEncoder extends React.Component {

  constructor(props) {
    super(props)
    this.state = Object.assign({}, props)
    this.encoder = new ScalarEncoder({
      min: props.min, max: props.max,
      w: 10, n: 100
    })
    this.encode()
    this.valToScreen = d3.scaleLinear()
        .domain([props.min, props.max])
        .range([0 + gutter, props.width - gutter])
    this.screenToVal = d3.scaleLinear()
        .domain([0 + gutter, props.width - gutter])
        .range([props.min, props.max])
    // This binding is necessary to make `this` work in the callback
    this.handleNumberLineHover = this.handleNumberLineHover.bind(this);
  }

  encode() {
    let encoding = this.encoder.encode(this.state.bits)
    console.log(`Encoding ${this.state.bits} into ${encoding}`)
    this.state.encoding = encoding
  }

  componentDidMount() {
    this.setupDiagram()
  }

  setupDiagram() {
    this.parent = d3.select("#" + this.state.id)
        .attr("width", this.state.width)
    this.addNumberLine(this.parent.select(".number-line"))
    this.addValueMarker(this.parent.select(".number-line"))
    this.addOutputCells(this.parent.select(".output-cells"))
  }

  addNumberLine(g) {
    let xAxis = d3.axisBottom(this.valToScreen)
    g.attr("transform", "translate(0,40)").call(xAxis)
  }

  addValueMarker(g) {
    let markerWidth = 1
    let markerHeight = 40

    let magicSix = 6
    let x = this.valToScreen(this.state.val) - (markerWidth / 2) - magicSix
    let y = 0 - (markerHeight / 2) - magicSix

    let text = g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-family", "sans-serif")
        .attr("font-size", "10pt")
        .text(this.state.val)

    let spacing = 7
    let mark = g.append("rect")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("width", markerWidth)
        .attr("height", markerHeight)
        .attr("x", x)
        .attr("y", y + spacing)
  }

  addOutputCells(g) {
    let topMargin = 120
    let bits = this.state.bits
    let width = this.state.width
    let bitsToOutputDisplay = d3.scaleLinear()
        .domain([0, bits])
        .range([0 + gutter, width - gutter])
    let cellWidth = Math.floor(width / bits)
    let cellHeight = 30

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
        .attr('y', topMargin)
        .attr('width', cellWidth)
        .attr('height', cellHeight)
    }

    // Update
    let rects = g.selectAll('rect').data(this.state.encoding)
    treatCellRects(rects)
    // Enter
    let newRects = rects.enter().append('rect')
    treatCellRects(newRects)
    // Exit
    rects.exit().remove()
  }

  handleNumberLineHover(e) {
    // console.log(this.parent.node())
    console.log(`${e.pageX}`)

    // if (mouse[1] > 80) return
    // let mouseX = mouse[0] - valueScaleSideMargins
    // mouseX = Math.min(maxWidth - (valueScaleSideMargins * 2), mouseX)
    // mouseX = Math.max(0, mouseX)
    // value = utils.precisionRound(xToValue(mouseX), 1)
  }


  render() {
    let debugStyle = {
      border: "solid red 1px"
    }
    return (
      <svg id={this.state.id} style={debugStyle}>

        <text x="10" y="20" fontSize="10pt">scalar value</text>
        <g className="number-line" onMouseMove={this.handleNumberLineHover}></g>

        <text x="10" y="80" fontSize="10pt">encoding</text>
        <g className="output-cells"></g>

      </svg>
    )
  }

}

SimpleScalarEncoder.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  val: PropTypes.number.isRequired,
  id: PropTypes.string.isRequired,
  bits: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
}

export default SimpleScalarEncoder
