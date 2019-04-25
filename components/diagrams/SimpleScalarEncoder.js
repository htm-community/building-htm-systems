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

    this.id = props.id
    this.min = props.min
    this.max = props.max
    this.val = props.val
    this.bits = props.bits
    this.width = props.width
    
    this.encoder = new ScalarEncoder({
      min: this.min, max: this.max,
      w: 18, n: this.bits,
      bounded: false,
    })

    this.encoding = this.encode(this.val)

    this.valToScreen = d3.scaleLinear()
        .domain([this.min, this.max])
        .range([0 + gutter, this.width - gutter])
    this.screenToVal = d3.scaleLinear()
        .domain([0 + gutter, this.width - gutter])
        .range([this.min, this.max])
    
    // This binding is necessary to make `this` work in the callback
    this.handleNumberLineHover = this.handleNumberLineHover.bind(this);
  }

  // Use the internal encoder to turn bits into
  encode(value) {
    let encoding = this.encoder.encode(value)
    console.log(`Encoding ${value} into ${encoding}`)
    return encoding
  }

  // https://reactjs.org/docs/react-component.html#componentdidmount
  componentDidMount() {
    // Sets up the d3 diagram
    this.parent = d3.select("#" + this.id)
        .attr("width", this.width)
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

    let x = this.valToScreen(this.val) - (markerWidth / 2)
    let y = 0 - (markerHeight / 2)

    // FIXME: standardize some styles for diagrams
    let text = g.append("text")
        .attr("x", x)
        .attr("y", y)
        .attr("font-family", "sans-serif")
        .attr("font-size", "10pt")
        .text(this.val)

    let mark = g.append("rect")
        .attr("stroke", "red")
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr("width", markerWidth)
        .attr("height", markerHeight)
        .attr("x", x)
        .attr("y", y)
  }

  addOutputCells(g) {
    let topMargin = 120
    let bits = this.bits
    let width = this.width
    let bitsToOutputDisplay = d3.scaleLinear()
        .domain([0, bits])
        .range([0 + gutter, width - gutter])
    let cellWidth = Math.floor(width / bits)
    let cellHeight = 30

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
        .attr('y', topMargin)
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
      <svg id={this.id} style={debugStyle}>

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
