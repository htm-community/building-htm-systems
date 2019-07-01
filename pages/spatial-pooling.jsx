import moment from 'moment'
import simplehtm from 'simplehtm'

import React from 'react'

// Layout
import Layout from '../components/Layout'
import CodeSyntax from '../components/CodeSyntax'

// Data Stream
import withScalarData from '../hoc/withScalarData';

// Code examples
import examples from '../examples/spatial-pooling'

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
		const ConnectedPercent = <NumberValue
			name="connected-percent" low={0} high={1.0} step={0.05}
			value={this.state.connectedPercent}
			onUpdate={value => this.setState({ connectedPercent: Number(value) })}
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

					<h1>Spatial Pooling</h1>

					<p>
						Spatial Pooling is a process that extracts semantic information from input to provide a controlled space to perform further operations. Additionally, input is converted into a sparse distributed representation (SDR), which provides further computational benefits (citation needed). Even though information is lost during this transformation, stability is gained and semantics are preserved through redundancy.
					</p>

					<p>
						The neocortex is a homogenous sheet of neurons. It is separated into individual processing units called <a href="https://en.wikipedia.org/wiki/Cortical_column">"cortical columns"</a>. Each cortical column performs essentially the same computations, and is separated into many <a href="https://en.wikipedia.org/wiki/Cerebral_cortex#Layers_of_neocortex">layers of different types of neurons</a>. Different layers perform different processes. They can be wired to receive input from different locations in the brain, or sensory input. 
					</p>

					<p>
						Spatial Pooling is a process that occurs in at least one of these cortical layers, throughout the neocortex, in every cortical column. A layer performing Spatial Pooling receives <em>feed forward</em> input to a population of neurons. This <em>feed forward</em> input may be sensory input, or input from other cortical areas. This input drives or causes neurons in the layer to activate.
					</p>

					<h2>Minicolumns</h2>

					<p>
						In cortical layers performing Spatial Pooling, there are structures called <a href="https://en.wikipedia.org/wiki/Cortical_minicolumn">minicolumns</a>. These structures group together neurons and force them to pay attention to the same subset of the input. The <em> feed forward input space</em> for a layer of cortex performing Spatial Pooling is the complete set of neurons that it may be connected to. This input space contains a massive amount of information. Each minicolumn receieves a unique subset of the input. We'll refer to this subset of the input as a minicolumn's <em>potential pool</em>.
					</p>

					<p>
						Neurons simulated by Spatial Pooling can be either excitatory or inhibitory. Excitatory neurons activate to represent semantic information. Inhibitory neurons enforce minicolumn groupings for the Spatial Pooling process.
					</p>

					<p>
						There may be thousands of minicolumn structures within a layer of a cortical column. Spatial Pooling is a competition between minicolumns to represent the information in the input space. As neuronal activations in the input space change, different minicolumns represent different input.
					</p>

					<h2>Input Space</h2>

					<p>
						Let's imagine a single scalar value changing over time. Based on previous examples of encodings, we might encoding this value in different semantic ways. For example, the scalar value could be encoded separately from the time semantics, as visualized below.
					</p>

					<table cellPadding="10px">
						<tbody>
							<tr>
								<td>{DataPlayer}</td>
								<td width="50%">{this.state.currentDataValue ? this.state.currentDataValue.toFixed(3) : ''}</td>
								<td>{this.state.currentDataTime}</td>
							</tr>
						</tbody>
					</table>

					<img src="/static/images/streaming-diagram-tmp.jpeg"/>

					<p>
						These semantics can be combined into one encoding that spans the entire input space for a population of neurons performing Spatial Pooling. 
					</p>

					<h3>Combined Encoding</h3>

					<figure className="figure">
						<CombinedEncoding
							id="combinedEncoding"
							diagramWidth={250}
							data={this.props.data}
							combined={this.state.combined}
						/>
						<figcaption className="figure-caption">
							<span><a href="#combinedEncoding">¶</a>Figure 1:</span> Combined encoding.
						</figcaption>
					</figure>

					<p>
						As you can see by toggling ({ToggleCombinedInput}), many different semantics of information are being encoded into the input space. However, the Spatial Pooling operation has no knowledge of these semantics or where the input comes from. Spatial Pooling uses overlapping <em>potential pools</em> of different minicolumns to extract the semantics of the input <strong>without prior knowledge</strong> of its structure.
					</p>

					<h2>Potential Pools</h2>

					<p>
						Each minicolumn has a unique potential pool of connections to the input space. Its neurons will only ever connect to input cells that fall within this potential pool. In the diagrams below, the percent of input minicolumns could connect to is {ConnectedPercent}. In the diagram below, click on different minicolumns on the left to display their different potential pools of connections on the right. As input passes through the input space, you can see how each minicolumn is restricted to seeing only a portion of the input information. Notice the green checkmarks and white x's in the input space. These indicate input that is observed and ignored by the selected minicolumn, respectively. As you decrease the {ConnectedPercent}, you should notice that more input is ignored by each minicolumn.
					</p>

					<figure className="figure">
						<PotentialPools
							id="potentialPools"
							diagramWidth={500}
							encoding={this.state.encoding}
							potentialPools={this.state.potentialPools}
							selectedMinicolumn={this.state.selectedMinicolumn}
							onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>
						<figcaption className="figure-caption">
							<span><a href="#potentialPools">¶</a>Figure 2:</span> Potential Pools.
						</figcaption>
					</figure>

					<p>
						Setting up minicolumn potential pools is not complicated. Upon initialization, each minicolumn's potential pool of connections is established using a simple random number generator. For each cell in the input space, a minicolumn either has a possibility of connecting, or not. The code below defines a minicolumn's potential pool as an array of indices of the input space to which it might connect.
					</p>

					<span>
						<a href="#code-example-1">¶</a>Code Example 1: Establishing minicolumn potential pools.
					</span>
					<div id="code-example-1">
						<CodeSyntax>{examples.code[0]}</CodeSyntax>
					</div>

					<h2>Permanences</h2>

					<p>
						The memory of all neural networks is stored in the connections between cells, called <a href="https://en.wikipedia.org/wiki/Synapse">synapses</a>. We model synapses as scalar <em>permanence values</em>. If they breach a <em>connection threshold</em>, they are connected.
					</p>

					<p>
						Within each minicolumn's potential pool, we must establish an initial state for each connection. This represents the strength of a synapse. In the diagram below, connection permanences are displayed in a "heat map" where green is less connected and red is more connected. 
					</p>

					<figure className="figure">
						<Permanences
							id="permanences"
							diagramWidth={500}
							showConnections={false}
							showDistribution={false}
							connectionThreshold={this.state.connectionThreshold}
							encoding={this.state.encoding}
							potentialPools={this.state.potentialPools}
							permanences={this.state.permanences}
							selectedMinicolumn={this.state.selectedMinicolumn}
							onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>
						<figcaption className="figure-caption">
							<span><a href="#permanences">¶</a>Figure 3.1:</span> Permanence values.
						</figcaption>
					</figure>

					<p>
						If a permanence breaches a connection threshold ({ConnectionThreshold}), we say that the connection is established, and the neuron is "connected" to the input cell. 
					</p>

					<figure className="figure">
						<Permanences
							id="permanences-and-connections"
							diagramWidth={500}
							showConnections={true}
							showDistribution={false}
							connectionThreshold={this.state.connectionThreshold}
							encoding={this.state.encoding}
							potentialPools={this.state.potentialPools}
							permanences={this.state.permanences}
							selectedMinicolumn={this.state.selectedMinicolumn}
							onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>
						<figcaption className="figure-caption">
							<span><a href="#permanences-and-connections">¶</a>Figure 3.2:</span> Permanence values and connections.
						</figcaption>
					</figure>

					<p>
						In the diagrams shown above, connections are initially established in a normal disribution around a center point ({DistributionCenter}). For the initial permanences, the connection threshold ({ConnectionThreshold}) should be near the distribution center. This ensures that synapses are primed to either connect or disconnect quickly when <em>learning</em>, ensuring more entropy in the initial state of the system.
					</p>
					<figure className="figure">
						<Permanences
							id="permanences-distributions"
							diagramWidth={500}
							showDistribution={true}
							connectionThreshold={this.state.connectionThreshold}
							encoding={this.state.encoding}
							potentialPools={this.state.potentialPools}
							permanences={this.state.permanences}
							selectedMinicolumn={this.state.selectedMinicolumn}
							onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>
						<figcaption className="figure-caption">
							<span><a href="#permanences-distributions">¶</a>Figure 3.3:</span>Permanence values, connections, and permanence distributions.
						</figcaption>
					</figure>

					<ul>
						<li>Learning is {ToggleLearning}</li>
						<li>Permanence Increment: {PermanenceIncrement}</li>
						<li>Permanence Decrement: {PermanenceDecrement}</li>
						<li>Connection threshold: {ConnectionThreshold}</li>
						<li>Connection distribution: {ConnectionDistribution}</li>
						<li>Center of disribution: {DistributionCenter}</li>
					</ul>

					<h3>Minicolumn Competition</h3>

					<figure className="figure">
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
						<figcaption className="figure-caption">
							<span><a href="#minicolumnCompetition">¶</a>Figure 4:</span> Minicolumn competition.
						</figcaption>
					</figure>

					<div>
						Selected minicolumn overlap: {this.state.overlaps ? this.state.overlaps[this.state.selectedMinicolumn].length : ''}
					</div>

					<h3>Active Duty Cycles</h3>

					<figure className="figure">
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
						<figcaption className="figure-caption">
							<span><a href="#activeDutyCycles">¶</a>Figure 5:</span> Active duty cycles.
						</figcaption>
					</figure>

					<div>
						Selected minicolumn ADC: {this.state.activeDutyCycles ? Math.round(this.state.activeDutyCycles[this.state.selectedMinicolumn] * 100) : ''}%
					</div>

				</Layout>
			</div>
		)
	}

}
export default withScalarData({ updateRate: 500 })(SpatialPooling)
