import React from 'react'
import PropTypes from 'prop-types'

const style =  { 
	border: 'solid gray 1px', 
	borderRadius: '4px', 
	fontWeight: 'bold',
	padding: '2px',
}

const NumberInput =
	({ high = 100, low = 0, onUpdate, precision = 0, value = 0, step = 1 }) =>
		<input type="number"
			value={value}
			min={low}
			max={high}
			step={step}
			style={style}
      onChange={(e) => { 
        let min = parseInt(e.target.min)
        let max = parseInt(e.target.max)
        let val = parseFloat(e.target.value)
        if (min < val && val <= max) {
          onUpdate(val)
        }
      }}
		/>
	
NumberInput.propTypes = {
	high: PropTypes.number,
	low: PropTypes.number,
	onUpdate: PropTypes.func.isRequired,
	precision: PropTypes.number,
	value: PropTypes.any,
}

export default NumberInput
