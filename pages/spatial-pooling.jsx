import moment from 'moment'
import simplehtm from 'simplehtm'

import React from 'react'

// Layout
import Layout from '../components/Layout'

// Data Stream
import withScalarData from '../hoc/withScalarData';

// Inputs
import ToggleButton from '../components/input/ToggleButton'
import NumberValue from '../components/input/NumberInput'
import Player from '../components/input/Player'

// Diagrams
import CombinedEncoding from '../components/diagrams/CombinedEncoding'
import PotentialPools from '../components/diagrams/PotentialPools'
import Permanences from '../components/diagrams/Permanences'
import MinicolumnCompetition from '../components/diagrams/MinicolumnCompetition'
import ActiveDutyCycles from '../components/diagrams/ActiveDutyCycles'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const SpatialPooler = simplehtm.algorithms.SpatialPooler

const minicolumnCount = 400
const winnerCount = 20

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
		activeDutyCycles: undefined,
		winners: undefined,
		currentDataValue: undefined,
		currentDataTime: undefined,
		selectedMinicolumn: 0,
		learning: 'off',
		permanenceInc: 0.05,
		permanenceDec: 0.025,
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
			if (this.state.learning === 'on') {
				this.sp.enableLearning()
				this.sp.opts.permanenceInc = this.state.permanenceInc
				this.sp.opts.permanenceDec = this.state.permanenceDec
			} else this.sp.disableLearning()
			const winners = this.sp.compete(encoding)
			const winnerIndices = winners.map(w => w.index)
			this.setState({
				winners: winnerIndices,
				potentialPools: this.sp.getPotentialPools(),
				permanences: this.sp.getPermanences(),
				overlaps: this.sp.getOverlaps(),
				activeDutyCycles: this.sp.computeActiveDutyCycles(winners),
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
			learn: this.state.learning === 'on',
			permanenceInc: this.state.permanenceInc,
			permanenceDec: this.state.permanenceDec,
		})
	}

	encode() {
		const { data: { time, value } } = this.props
		let encoding = []

		// scalar
		encoding = encoding.concat(this.scalarEncoder.encode(value))
		// day of week (discrete)
		encoding = encoding.concat(this.dayOfWeekEncoder.encode(days[time.getDay()]))
		// day of month
		encoding = encoding.concat(this.dayOfMonthEncoder.encode(time.getDate()))
		// hour of day
		encoding = encoding.concat(this.hourOfDayEncoder.encode(time.getHours()))
		// weekend
		encoding = encoding.concat(this.weekendEncoder.encode(time))

		return encoding
	}

	render() {

		const ToggleCombinedInput = <ToggleButton
			options={['combined', 'split']}
			value={this.state.combined}
			onChange={(value) => this.setState({ combined: value })}
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
		const DataPlayer = <Player
			name="data-player"
			onUpdate={value => {
				if (value) this.props.startData()
				else this.props.stopData()
			}}
		/>
		const ToggleLearning = <ToggleButton
			options={['on', 'off']}
			value={this.state.learning}
			onChange={(value) => this.setState({ learning: value })}
		/>
		const PermanenceIncrement = <NumberValue
			name="perm-inc" low={0.0} high={1.0} step={0.025}
			value={this.state.permanenceInc}
			onUpdate={value => this.setState({ permanenceInc: Number(value) })}
		/>
		const PermanenceDecrement = <NumberValue
			name="perm-inc" low={0.0} high={1.0} step={0.025}
			value={this.state.permanenceDec}
			onUpdate={value => this.setState({ permanenceDec: Number(value) })}
		/>



		return (
			<div>
				<Layout>
					<h2>Spatial Pooling Prototype Page</h2>

					<table cellPadding="10px">
						<tbody>
							<tr>
								<td>{DataPlayer}</td>
								<td width="50%">{this.state.currentDataValue ? this.state.currentDataValue.toFixed(3) : ''}</td>
								<td>{this.state.currentDataTime}</td>
							</tr>
						</tbody>
					</table>

					<h3>Combined Encoding</h3>

					<CombinedEncoding
						id="combinedEncoding"
						diagramWidth={200}
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
						<li>Learning is {ToggleLearning}</li>
						<li>Permanence Increment: {PermanenceIncrement}</li>
						<li>Permanence Decrement: {PermanenceDecrement}</li>
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

					<h3>Active Duty Cycles</h3>

					<ActiveDutyCycles
						id="activeDutyCycles"
						diagramWidth={500}
						encoding={this.state.encoding}
						potentialPools={this.state.potentialPools}
						activeDutyCycles={this.state.activeDutyCycles}
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
export default withScalarData({ updateRate: 200 })(SpatialPooling)
