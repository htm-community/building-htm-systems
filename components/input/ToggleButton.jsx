export default function({ value, options, onChange  }) {
	return 	(<button 
		onClick={() => {
				if(onChange)  {
					onChange(value === options[0] ? options[1] : options[0])
				}
			}}>
		{value}
	</button>);
}


/*

Example

<ToggleButton options={['line', 'circle']} value={this.state.staetPropName} onChange={(newValue) => this.setState({ staetPropName: newValue })} />

*/
