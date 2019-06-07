import React from 'react'
import Layout from '../components/Layout'
import withScalarData from '../hoc/withScalarData';
import ToggleButton from '../components/input/ToggleButton'
import NumberValue from '../components/input/NumberInput'

import CombinedEncoding from '../components/diagrams/CombinedEncoding'
import PotentialPools from '../components/diagrams/PotentialPools'
import Permanences from '../components/diagrams/Permanences'


class SpatialPooling extends React.Component {

	state = {
		combined: 'combined',
		connectionThreshold: 0.5,
		connectionDistribution: 25,
		distributionCenter: 0.5,
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
		const ConnectionThreshold = <NumberValue
			name="connection-threshold" low={0} high={1.0} step={0.02}
			value={this.state.connectionThreshold}
			onUpdate={value => this.setState({ connectionThreshold: Number(value) })}
		/>
		const ConnectionDistribution = <NumberValue
			name="connection-dist" low={1} high={50}
			value={this.state.connectionDistribution}
			onUpdate={value => this.setState({ connectionDistribution: Number(value) })}
		/>
		const DistributionCenter = <NumberValue
			name="dist-center" low={0} high={1} step={0.02}
			value={this.state.distributionCenter}
			onUpdate={value => this.setState({ distributionCenter: Number(value) })}
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
						connectionThreshold={this.state.connectionThreshold}
						connectionDistribution={this.state.connectionDistribution}
						distributionCenter={this.state.distributionCenter}
						inputSpaceSize={500}
					/>

					{ConnectionThreshold}  {ConnectionDistribution} {DistributionCenter}

				</Layout>
			</div>
		)
	}

}
 export default withScalarData({ updateRate: 1000 })(SpatialPooling)
