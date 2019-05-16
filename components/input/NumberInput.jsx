import React from 'react'
import PropTypes from 'prop-types'

const style =  { 
	border: 'solid gray 1px', 
	borderRadius: '4px', 
	fontWeight: 'bold',
	padding: '2px',
}

const NumberInput = ({ high = 100, low = 0, onUpdate, precision = 0, value = 0}) => <input type="number" min={low} max={high} style={style} value={value} onChange={(e) => onUpdate(e.target.value)} step="1" />
  
NumberInput.propTypes = {
	high: PropTypes.number,
	low: PropTypes.number,
	onUpdate: PropTypes.func.isRequired,
	precision: PropTypes.number,
	value: PropTypes.any,
}

export default NumberInput
