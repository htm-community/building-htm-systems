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
import SimpleCyclicEncoder from '../components/diagrams/SimpleCyclicEncoder'
import CombinedEncoding from '../components/diagrams/CombinedEncoding'
import PotentialPools from '../components/diagrams/PotentialPools'
import Permanences from '../components/diagrams/Permanences'
import MinicolumnCompetition from '../components/diagrams/MinicolumnCompetition'
import DutyCycles from '../components/diagrams/DutyCycles'
import CompetitionStackRank from '../components/diagrams/CompetitionStackRank'
import StreamingScalarDiagram from '../components/diagrams/StreamingScalarDiagram'
// import DiagramStub from '../components/diagrams/DiagramStub'

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const { BoundedScalarEncoder, CyclicEncoder, DayOfWeekCategoryEncoder, WeekendEncoder } = simplehtm.encoders

const SpatialPooler = simplehtm.algorithms.SpatialPooler

const minicolumnCount = 400
const scalarColor = '#80bfff'
const scalarEncodingColor = '#037ffc'
const dayOfWeekColor = '#F3C300'
const dayOfMonthColor = '#DF0024'
const hourOfDayColor = '#2E6DB4'
const weekendColor = '#00AC9F'

const diagramWidth = 500

const encodingParams = {
	scalar: { n: 80, w: 17 , min: -1, max: 1 },
	dayOfWeek: { n: 17, w: 5 },
	dayOfMonth: { n: 20, w: 3, min: 1, max: 31 },
	hourOfDay: { n: 21, w: 5, min: 0, max: 23  },
	weekend: { w: 15},
}

class SpatialPooling extends React.Component {

	state = {
		// UI state
		combined: 'split',
		// SP State
		connectionThreshold: 0.5,
		connectionDistribution: 25,
		distributionCenter: 0.5,
		connectedPercent: 0.85,
		// Calculated updon automated data change
		scalarEncoding: undefined,
		dayOfWeekEncoding: undefined,
		dayOfMonthEncoding: undefined,
		hourOfDayEncoding: undefined,
		weekendEncoding: undefined,
		potentialPools: undefined,
		permanences: undefined,
		encoding: undefined,
		overlaps: undefined,
		activeDutyCycles: undefined,
		overlapDutyCycles: undefined,
		winners: undefined,
		currentDataValue: undefined,
		currentDataTime: undefined,
		selectedMinicolumn: 0,
		learning: 'off',
		permanenceInc: 0.05,
		permanenceDec: 0.025,
		kWinnerCount: 20,
		dutyCyclePeriod: 100,
	}

	scalarEncoder = new BoundedScalarEncoder({
		w: encodingParams.scalar.w,
		n: encodingParams.scalar.n,
		min: encodingParams.scalar.min,
		max: encodingParams.scalar.max,
	})
	dayOfWeekEncoder = new DayOfWeekCategoryEncoder({
		w: encodingParams.dayOfWeek.w,
		n: encodingParams.dayOfWeek.n,
	})
	dayOfMonthEncoder = new CyclicEncoder({
		w: encodingParams.dayOfMonth.w,
		n: encodingParams.dayOfMonth.n,
		min: encodingParams.dayOfMonth.min,
		max: encodingParams.dayOfMonth.max,
	})
	hourOfDayEncoder = new CyclicEncoder({
		w: encodingParams.hourOfDay.w,
		n: encodingParams.hourOfDay.n,
		min: encodingParams.hourOfDay.min,
		max: encodingParams.hourOfDay.max,
	})
	weekendEncoder = new WeekendEncoder({
		n: encodingParams.weekend.n,
		w: encodingParams.weekend.w,
	})

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
			const winners = this.sp.compete(encoding)
			const winnerIndices = winners.map(w => w.index)
			const { time, value } = this.props.data
			this.setState({
				winners: winnerIndices,
				scalarEncoding: this.scalarEncoder.encode(value),
				// Time encodings are reverse() because I want them to cycle clockwise
				dayOfWeekEncoding: this.dayOfWeekEncoder.encode(days[time.getDay()]).reverse(),
				dayOfMonthEncoding: this.dayOfMonthEncoder.encode(time.getDate()).reverse(),
				hourOfDayEncoding: this.hourOfDayEncoder.encode(time.getHours()).reverse(),
				weekendEncoding: this.weekendEncoder.encode(time).reverse(),
				potentialPools: this.sp.getPotentialPools(),
				permanences: this.sp.getPermanences(),
				overlaps: this.sp.getOverlaps(),
				activeDutyCycles: this.sp.getMeanActiveDutyCycles(),
				overlapDutyCycles: this.sp.getMeanOverlapDutyCycles(),
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
				// User changed something that will require an SP re-initialization
				this.initializeSpatialPooler(this.state.encoding.length)
			} else {
				// For any other SP param changes, we won't even check, we'll just update them all
				// FIXME: inappropriate intimacy
				this.sp.opts.permanenceInc = this.state.permanenceInc
				this.sp.opts.permanenceDec = this.state.permanenceDec
				this.sp.opts.winnerCount = this.state.kWinnerCount
				this.sp.opts.connectionThreshold = this.state.connectionThreshold
				this.sp.opts.dutyCyclePeriod = this.state.dutyCyclePeriod
				this.sp.opts.learn = this.state.learning === 'on'
			}
		}
	}

	initializeSpatialPooler(inputCount) {
		console.warn('Reninitializing SP')
		this.sp = new SpatialPooler({
			inputCount: inputCount,
			size: minicolumnCount,
			connectionThreshold: this.state.connectionThreshold,
			batesIndependentVariables: this.state.connectionDistribution,
			connectedPercent: this.state.connectedPercent,
			distributionCenter: this.state.distributionCenter,
			winnerCount: this.state.kWinnerCount,
			learn: this.state.learning === 'on',
			permanenceInc: this.state.permanenceInc,
			permanenceDec: this.state.permanenceDec,
			dutyCyclePeriod: this.state.dutyCyclePeriod,
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
		const KWinnerCount = <NumberValue
			name="k-winners" low={1} high={100}
			value={this.state.kWinnerCount}
			onUpdate={value => this.setState({ kWinnerCount: Number(value) })}
		/>
		const DutyCyclePeriod = <NumberValue
			name="duty-cycle-period" low={1} high={1000}
			value={this.state.dutyCyclePeriod}
			onUpdate={value => this.setState({ dutyCyclePeriod: Number(value) })}
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

					<figure className="figure">
						<table className="streaming">
							<tbody>
								<tr className="section">
									<td>
										<StreamingScalarDiagram
											id="streamingScalar"
											diagramWidth={diagramWidth}
											diagramHeight={200}
											windowSize={200}
											color={scalarColor}
											cellColor={scalarEncodingColor}
											value={this.state.currentDataValue}
											time={this.state.currentDataTime}
											encoding={this.state.scalarEncoding}
										/>
									</td>
								</tr>
								<tr className="section">
									<table>
										<tbody>
											<tr>
												<td>
													<SimpleCyclicEncoder
														id="dayOfWeek"
														diagramWidth={diagramWidth / 2}
														label="day of week"
														color={dayOfWeekColor}
														encoding={this.state.dayOfWeekEncoding}
													/>
												</td>
												<td>
													<SimpleCyclicEncoder
														id="weekend"
														diagramWidth={diagramWidth / 2}
														label="weekend"
														color={weekendColor}
														encoding={this.state.weekendEncoding}
													/>
												</td>
											</tr>
											<tr>
												<td>
													<SimpleCyclicEncoder
														id="dayOfMonth"
														diagramWidth={diagramWidth / 2}
														label="day of month"
														color={dayOfMonthColor}
														encoding={this.state.dayOfMonthEncoding}
													/>
												</td>
												<td>
													<SimpleCyclicEncoder
														id="hourOfDay"
														diagramWidth={diagramWidth / 2}
														label="hour of day"
														color={hourOfDayColor}
														encoding={this.state.hourOfDayEncoding}
													/>
												</td>
											</tr>
										</tbody>
									</table>
								</tr>
							</tbody>
						</table>
						<figcaption className="figure-caption">
							<span><a href="#streamingScalar">¶</a>Figure 1:</span> Timestamped scalar data being streamed and encoded.
						</figcaption>
					</figure>

					<p>
						These semantics can be combined into one encoding that spans the entire input space for a population of neurons performing Spatial Pooling.
					</p>

					<h3>Combined Encoding</h3>

					<figure className="figure">
						<CombinedEncoding
							id="combinedEncoding"
							diagramWidth={diagramWidth / 2}
							params={encodingParams}
							combined={this.state.combined}
							scalarEncoding={this.state.scalarEncoding}
							scalarColor={scalarEncodingColor}
							dayOfWeekEncoding={this.state.dayOfWeekEncoding}
							dayOfWeekColor={dayOfWeekColor}
							weekendEncoding={this.state.weekendEncoding}
							weekendColor={weekendColor}
							dayOfMonthEncoding={this.state.dayOfMonthEncoding}
							dayOfMonthColor={dayOfMonthColor}
							hourOfDayEncoding={this.state.hourOfDayEncoding}
							hourOfDayColor={hourOfDayColor}
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
							diagramWidth={diagramWidth}
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
							diagramWidth={diagramWidth}
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
							diagramWidth={diagramWidth}
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

					<p>
						There are many ways we might establish initial permanences, but the important thing is to establish most of the permanences close to the connection threshold. We will use a <a href="https://en.wikipedia.org/wiki/Bates_distribution">Bates distribution</a>, which gives us a variable to change the intensity of the distribution curve. As you increase the number of "independent variables" in the Bates distribution, the peak of the curve becomes more prominent. See this in actino by changing this value here: {ConnectionDistribution}. (See also <a href="https://en.wikipedia.org/wiki/Kurtosis">kurtosis</a>.)
					</p>

					<p>
						Initial permanence values are established once, when the Spatial Pooler is initialized. These values will only change if learning is enabled (more on this later). The logic below uses the <a href="https://github.com/d3/d3-random#randomBates">D3JS <code>randomBates</code> function</a> to establish the values.
					</p>

					<span>
						<a href="#code-example-2">¶</a>Code Example 2: Establishing minicolumn initial permanence values using a Random Bates distribution.
					</span>
					<div id="code-example-2">
						<CodeSyntax>{examples.code[1]}</CodeSyntax>
					</div>

					<p>
						This function returns an array of permanence values for each minicolumn. Each array defines how connected that minicolumn is toward the input space. These arrays do not cover the entire input space, but only the minicolumn's potential pool. To get a permanence value's input space cell, you must access the minicolumn's potential pool.
					</p>

					<figure className="figure">
						<Permanences
							id="permanences-distributions"
							diagramWidth={diagramWidth}
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

					<h3>Minicolumn Competition</h3>

					{DataPlayer}

					<p>
						For each input, minicolumns compete to represent the semantics of the input. They do this by comparing their <em>overlap scores</em>.
					</p>

					<p>
						An <strong>overlap score</strong> denotes how strongly a minicolumn matches the current input. Press this pause button above and inspect the diagram below by selecting minicolumns in the left chart. The redder minicolumns have more overlap with the current input value than the green minicolumns. As you click around the space, notice the <em>overlap score</em> changing. This is the number of connected synapses that overlap the <em>on</em> bits in the input space at this time step. You can verify this score is correct by counting the number of solid blue circles in the input space. Notice they are all on top of the a grey input box, which represents an on bit. Connected synapses that do not overlap the current input (empty circles) are not counted in the overlap score.
					</p>

					<figure className="figure">
						<MinicolumnCompetition
							id="minicolumnOverlap"
							diagramWidth={diagramWidth}
							encoding={this.state.encoding}
							potentialPools={this.state.potentialPools}
							overlaps={this.state.overlaps}
							winners={this.state.winners}
							connectionThreshold={this.state.connectionThreshold}
							permanences={this.state.permanences}
							selectedMinicolumn={this.state.selectedMinicolumn}
							showCompetition={false}
							onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>
						<figcaption className="figure-caption">
							<span><a href="#minicolumnOverlap">¶</a>Figure 4.1:</span> Minicolumn competition.
						</figcaption>
					</figure>

					<p>
						Here is another view of the minicolumns, ordered by their overlap scores. Those with higher overlap scores are at the left of the diagram. During the competition,
						minicolumns with the highest overlap scores should represent the input data. To choose the "winners" of the competition, we decide how many minicolumns we want to represent the data, and cut the stack at that point. In machine learning terms, this is called a <em><a href="https://en.wikipedia.org/wiki/Winner-take-all_(computing)">k-winners-take-all</a></em> operation. We can easily control the sparsity of this new representation by changing k. Try changing k here: {KWinnerCount}.
					</p>

					{DataPlayer}

					<figure className="figure">
						<CompetitionStackRank
							id="stackRank"
							diagramWidth={diagramWidth}
							overlaps={this.state.overlaps}
							winners={this.state.winners}
							selectedMinicolumn={this.state.selectedMinicolumn}
							onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>
						<figcaption className="figure-caption">
							<span><a href="#stackRank">¶</a>Figure 4.2:</span> Stack ranking of minicolumns by overlap score.
						</figcaption>
					</figure>

					<br/>

					<figure className="figure">
						<MinicolumnCompetition
							id="minicolumnCompetition"
							diagramWidth={diagramWidth}
							encoding={this.state.encoding}
							potentialPools={this.state.potentialPools}
							overlaps={this.state.overlaps}
							winners={this.state.winners}
							connectionThreshold={this.state.connectionThreshold}
							permanences={this.state.permanences}
							selectedMinicolumn={this.state.selectedMinicolumn}
							showCompetition={true}
							onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>
						<figcaption className="figure-caption">
							<span><a href="#minicolumnCompetition">¶</a>Figure 4.3:</span> Minicolumn competition.
						</figcaption>
					</figure>

					<ul>
						<li>Learning is {ToggleLearning}</li>
						<li>Permanence Increment: {PermanenceIncrement}</li>
						<li>Permanence Decrement: {PermanenceDecrement}</li>
						<li>Connection threshold: {ConnectionThreshold}</li>
						<li>Connection distribution: {ConnectionDistribution}</li>
						<li>Center of disribution: {DistributionCenter}</li>
						<li>Duty Cycle Period: {DutyCyclePeriod}</li>
					</ul>

					<div>
						Selected minicolumn overlap: {this.state.overlaps ? this.state.overlaps[this.state.selectedMinicolumn].length : ''}
					</div>

					<h3>Duty Cycles</h3>

					<h4>Active Duty Cycles</h4>

					<figure className="figure">
						<DutyCycles
							id="activeDutyCycles"
							diagramWidth={diagramWidth}
							encoding={this.state.encoding}
							potentialPools={this.state.potentialPools}
							dutyCycles={this.state.activeDutyCycles}
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

					<h4>Overlap Duty Cycles</h4>

					<figure className="figure">
						<DutyCycles
							id="overlapDutyCycles"
							diagramWidth={diagramWidth}
							encoding={this.state.encoding}
							potentialPools={this.state.potentialPools}
							dutyCycles={this.state.overlapDutyCycles}
							winners={this.state.winners}
							connectionThreshold={this.state.connectionThreshold}
							permanences={this.state.permanences}
							selectedMinicolumn={this.state.selectedMinicolumn}
							onUpdate={selectedMinicolumn => this.setState({ selectedMinicolumn })}
						/>
						<figcaption className="figure-caption">
							<span><a href="#overlapDutyCycles">¶</a>Figure 6:</span> Overlap duty cycles.
						</figcaption>
					</figure>

					<div>
						Selected minicolumn ODC: {this.state.overlapDutyCycles ? Math.round(this.state.overlapDutyCycles[this.state.selectedMinicolumn]) : ''}
					</div>


				</Layout>
			</div>
		)
	}

}
export default withScalarData({ updateRate: 500 })(SpatialPooling)
