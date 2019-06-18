import moment from 'moment'
import simplehtm from 'simplehtm'

import React from 'react'
import Layout from '../components/Layout'
import withScalarData from '../hoc/withScalarData';
import ToggleButton from '../components/input/ToggleButton'
import NumberValue from '../components/input/NumberInput'

import CombinedEncoding from '../components/diagrams/CombinedEncoding'
import PotentialPools from '../components/diagrams/PotentialPools'
import Permanences from '../components/diagrams/Permanences'
import MinicolumnCompetition from '../components/diagrams/MinicolumnCompetition'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const SpatialPooler = simplehtm.algorithms.SpatialPooler

const minicolumnCount = 400
const winnerCount = 20

const learn = false
const permanenceInc = 0.05
const permanenceDec = 0.025

class SpatialPooling extends React.Component {

	state = {
		// UI state
		combined: 'combined',
		// SP State
		connectionThreshold: 0.5,
		connectionDistribution: 25,
		distributionCenter: 0.5,
		connectedPercent: 0.85,
		// Calculated updon automated data change
		potentialPools: undefined,
		permanences: undefined,
		encoding: undefined,
		overlaps: undefined,
		winners: undefined,
		currentDataValue: undefined,
		currentDataTime: undefined,
		selectedMinicolumn: 0,
	}

	scalarEncoder = new BoundedScalarEncoder({
		w: 10, n: 50, min: -1, max: 1
	})
	dayOfWeekEncoder = new DayOfWeekCategoryEncoder({
		w: 3
	})
	dayOfMonthEncoder = new CyclicEncoder({
		w: 5, n: 20,
		min: 1, max: 31,
	})
	hourOfDayEncoder = new CyclicEncoder({
		w: 7, n: 50,
		min: 0, max: 23,
	})
	weekendEncoder = new WeekendEncoder({ w: 7 })

	sp = undefined

	componentDidMount() {
		this.props.startData()
	}

	componentDidUpdate(prevProps, prevState) {

		if (this.props.data.value !== prevProps.data.value) {
			// Automatic data feed upate
			const encoding = this.encode()
			if (!this.sp) {
				this.initializeSpatialPooler(encoding.length)
			}
			const winners = this.sp.compete(encoding).map(w => w.index)
			this.setState({
				winners: winners,
				potentialPools: this.sp.getPotentialPools(),
				permanences: this.sp.getPermanences(),
				overlaps: this.sp.getOverlaps(),
				encoding: encoding,
				currentDataValue: this.props.data.value,
				currentDataTime: moment(this.props.data.time)
					           			.format('dddd, MMMM Do YYYY, h:mm:ss a'),
			})
		} else {
			if (prevState.connectionDistribution !== this.state.connectionDistribution
				|| prevState.connectedPercent !== this.state.connectedPercent
				|| prevState.distributionCenter !== this.state.distributionCenter
			) {
				this.initializeSpatialPooler(this.state.encoding.length)
			} else if (prevState.connectionThreshold !== this.state.connectionThreshold) {
				// FIXME: simplehtm SP needs to provide API to change this
				this.sp.opts.connectionThreshold = this.state.connectionThreshold
			}
		}
	}

	initializeSpatialPooler(inputCount) {
		this.sp = new SpatialPooler({
			inputCount: inputCount,
			size: minicolumnCount,
			connectionThreshold: this.state.connectionThreshold,
			batesIndependentVariables: this.state.connectionDistribution,
			connectedPercent: this.state.connectedPercent,
			distributionCenter: this.state.distributionCenter,
			winnerCount: winnerCount,
			learn: learn,
			permanenceInc: permanenceInc,
			permanenceDec: permanenceDec,
		})
	}

	encode() {
    const { data: { time, value } } = this.props
		let encoding = []

		// scalar
		encoding = encoding.concat(this.scalarEncoder.encode(value))
		console.log(value)
		// day of week (discrete)
		encoding = encoding.concat(this.dayOfWeekEncoder.encode(days[time.getDay()]))
		// day of month
		encoding = encoding.concat(this.dayOfMonthEncoder.encode(time.getDate()))
		// hour of day
		encoding = encoding.concat(this.hourOfDayEncoder.encode(time.getHours()))
		// weekend
		encoding = encoding.concat(this.weekendEncoder.encode(time))

		console.log(encoding)

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

					<table cellPadding="10px">
						<tbody>
						<tr>
							<td width="50%">{this.state.currentDataValue}</td>
							<td>{this.state.currentDataTime}</td>
						</tr>
						</tbody>
					</table>
					
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
						selectedMinicolumn={this.state.selectedMinicolumn}
						onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>

					<h3>Permanences</h3>

					<Permanences
						id="permanences"
						diagramWidth={500}
						connectionThreshold={this.state.connectionThreshold}
						encoding={this.state.encoding}
						potentialPools={this.state.potentialPools}
						permanences={this.state.permanences}
						selectedMinicolumn={this.state.selectedMinicolumn}
						onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
					/>

					<ul>
						<li>Connection threshold: {ConnectionThreshold}</li>
						<li>Connection distribution: {ConnectionDistribution}</li>
						<li>Center of disribution: {DistributionCenter}</li>
					</ul>

					<h3>Minicolumn Competition</h3>

					<MinicolumnCompetition
						id="minicolumnCompetition"
						diagramWidth={500}
						encoding={this.state.encoding}
						potentialPools={this.state.potentialPools}
						overlaps={this.state.overlaps}
						winners={this.state.winners}
						connectionThreshold={this.state.connectionThreshold}
						permanences={this.state.permanences}
						selectedMinicolumn={this.state.selectedMinicolumn}
						onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
					/>

				</Layout>
			</div>
		)
	}

}
 export default withScalarData({ updateRate: 500 })(SpatialPooling)
