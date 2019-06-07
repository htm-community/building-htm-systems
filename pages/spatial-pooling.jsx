import React from 'react'
import Layout from '../components/Layout'
import withScalarData from '../hoc/withScalarData';
import ToggleButton from '../components/input/ToggleButton'

import CombinedEncoding from '../components/diagrams/CombinedEncoding'
import PotentialPools from '../components/diagrams/PotentialPools'
import Permanences from '../components/diagrams/Permanences'


class SpatialPooling extends React.Component {

	state = {
		combined: 'combined'
	}

	componentDidMount() {
		this.props.startData();
	}

	render() {

		const ToggleCombinedInput = <ToggleButton
			options={['combined', 'split']}
			value={this.state.combined}
			onChange={(newValue) => this.setState({ combined: newValue })}
		/>

		return (
			<div>
				<Layout>
					<h2>Spatial Pooling Prototype Page</h2>
					
					<h3>Combined Encoding</h3>

					<CombinedEncoding
						id="combinedEncoding"
						diagramWidth={500}
						data={this.props.data}
						combined={this.state.combined}
					/>

					{ToggleCombinedInput} 
					
					<h3>Potential Pools</h3>

					<PotentialPools
						id="potentialPools"
						diagramWidth={500}
						minicolumnCount={2048}
						connectedPercent={0.85}
						data={this.props.data}
					/>

					<h3>Permanences</h3>

					<Permanences
						id="permanences"
						diagramWidth={500}
						minicolumnCount={2048}
						connectedPercent={0.85}
						connectionThreshold={0.85}
						inputSpaceSize={400}
					/>

				</Layout>
			</div>
		)
	}

}
 export default withScalarData({ updateRate: 1000 })(SpatialPooling)
