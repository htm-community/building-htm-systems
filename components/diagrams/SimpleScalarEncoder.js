import * as d3 from 'd3'

class SimpleScalarEncoder extends React.Component {

  constructor(props) {
    super(props)
    this.state = Object.assign({}, props)
  }

  componentDidMount() {
    this.setupDiagram()
  }

  setupDiagram() {
    let svg = d3.select("#" + this.state.id)
    this.addNumberLine(svg)
  }

  addNumberLine(svg) {

  }

  addOutputCells() {}


  render() {

    return (
      <svg id={this.state.id}>
        <text x="10" y="30" font-size="10pt">scalar value</text>
        <text x="10" y="100" font-family="sans-serif" font-size="10pt">encoding</text>
      </svg>
    )
  }

}

export default SimpleScalarEncoder
