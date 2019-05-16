import React, { useState, useEffect } from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
const style = {
  border: 'solid gray 1px',
  borderRadius: '4px',
  fontWeight: 'bold',
  padding: '2px',
}

class NumberScrubber extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      value: props.value,
    }
  }

  componentDidMount() {
    let me = this
    const positionToValue = d3.scaleLinear()
      .clamp(true)
      .domain([-100, +100])
      .range([me.props.low, me.props.high])
    console.log('Number componentDidMount')
    d3.selectAll(`.${me.props.name}`)
      .call(d3.drag()
        .subject(() => {
          let startingValue = me.state.value
          let x = positionToValue.invert(startingValue)
          return {
            x: x,
            y: 0,
          }
        })
        .on('drag', () => {
          let event = d3.event
          let pixelDrag = event.x - event.subject.x
          let val = Number(positionToValue(pixelDrag).toFixed(me.props.precision))
          // Only set the state if there is a difference
          if (val !== me.state.value) {
            // console.log(`x: ${event.x}\tdx: ${event.dx}\tvalue: ${me.state.value}`)
            me.setState({ value: val })
            me.props.onUpdate(me.state.value)
          }
        })
      )
  }

  render() {
    return <span className={this.props.name} style={style}>{this.props.value}</span>
  }
}

NumberScrubber.propTypes = {
  high: PropTypes.number.isRequired,
  low: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  onUpdate: PropTypes.func.isRequired,
  precision: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
}

export default NumberScrubber
