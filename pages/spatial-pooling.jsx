import simplehtm from 'simplehtm'

import React from 'react'
import Layout from '../components/Layout'
import withScalarData from '../hoc/withScalarData';
import ToggleButton from '../components/input/ToggleButton'
import NumberValue from '../components/input/NumberInput'

import CombinedEncoding from '../components/diagrams/CombinedEncoding'
import PotentialPools from '../components/diagrams/PotentialPools'
import Permanences from '../components/diagrams/Permanences'

const offColor = '#FFF'
const combinedColor = '#BBB'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const SpatialPooler = simplehtm.algorithms.SpatialPooler

class SpatialPooling extends React.Component {

	state = {
		combined: 'combined',
		connectionThreshold: 0.5,
		connectionDistribution: 25,
		distributionCenter: 0.5,
		potentialPools: undefined,
		permanences: undefined,
		encoding: undefined,
	}

	scalarEncoder = new BoundedScalarEncoder({
		w: 20, n: 100, min: 0, max: 1
	})
	dayOfWeekEncoder = new DayOfWeekCategoryEncoder({
		w: 3
	})
	dayOfMonthEncoder = new CyclicEncoder({
		w: 5, n: 40,
		min: 1, max: 31,
	})
	hourOfDayEncoder = new CyclicEncoder({
		w: 7, n: 100,
		min: 0, max: 23,
	})
	weekendEncoder = new WeekendEncoder({ w: 11 })

	componentDidMount() {
		this.props.startData()
	}

	componentDidUpdate(prevProps) {
		if (this.props.data.value !== prevProps.data.value) {
			const encoding = this.encode()
			const sp = new SpatialPooler({
				inputCount: encoding.length,
				size: 2048,
				connectedPercent: 0.85,
				connectionThreshold: 0.5,
				winnerCount: 40,
			})
			this.setState({
				potentialPools: sp.getPotentialPools(),
				permanences: sp.getPotentialPools(),
				encoding: encoding,
			})
		}
	}

	encode() {
    const { data: { time, value }, combined } = this.props
		const encoding = []
		function colorFn(bit) {
			encoding.push(bit ? combinedColor : offColor)
		}

		// scalar
		this.scalarEncoder.encode(value).forEach(colorFn)
		// day of week (discrete)
		this.dayOfWeekEncoder.encode(days[time.getDay()]).forEach(colorFn)
		// day of month
		this.dayOfMonthEncoder.encode(time.getDate()).forEach(colorFn)
		// hour of day
		this.hourOfDayEncoder.encode(time.getHours()).forEach(colorFn)
		// weekend
		this.weekendEncoder.encode(time).forEach(colorFn)

		return encoding
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
						encoding={this.state.encoding}
						potentialPools={this.state.potentialPools}
					/>

					<h3>Permanences</h3>

					{/* <Permanences
						id="permanences"
						diagramWidth={500}
						data={this.props.permanences}
					/> */}

					{ConnectionThreshold}  {ConnectionDistribution} {DistributionCenter}

				</Layout>
			</div>
		)
	}

}
 export default withScalarData({ updateRate: 1000 })(SpatialPooling)
