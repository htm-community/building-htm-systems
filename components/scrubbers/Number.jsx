import React, { useEffect } from 'react'
import * as d3 from 'd3'
import PropTypes from 'prop-types'
const style =  { 
	border: 'solid gray 1px', 
	borderRadius: '4px', 
	fontWeight: 'bold',
	padding: '2px',
}

const Number = ({ high = 100, name, low = 0, onUpdate, precision = 0, value = 0}) => {
	const ref = React.createRef()
  
	useEffect(() => {
		const positionToValue = d3.scaleLinear()
			.clamp(true)
			.domain([-100, +100])
			.range([low, high])
	
		d3.selectAll(`.${name}`)
			.call(d3.drag()
				.on('drag', () => {
					onUpdate(positionToValue(d3.event.dx).toFixed(precision))
				}))  
	}, [])
  
	return <span className={name} ref={ref} style={style}>{value}</span>
}
  
Number.propTypes = {
	high: PropTypes.number,
	low: PropTypes.number,
	name: PropTypes.string.isRequired,
	onUpdate: PropTypes.func.isRequired,
	precision: PropTypes.number,
	value: PropTypes.any,
}

export default Number