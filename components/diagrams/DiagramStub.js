class DiagramStub extends React.Component {

  constructor(props) {
    super(props)
    this.id = props.id
  }

  render() {
    return (
      <h3 id={this.id}>
      Diagram Stub "{this.id}"
      </h3>
    )
  }

}

export default DiagramStub
