import React from 'react'
import Layout from '../components/Layout'

const Index = () => (
	<div>
		<Layout>
			<h1>Building HTM Systems</h1>
			<p>
				This website is under active development. Some of the development is live-coded on <a href="https://www.youtube.com/OfficialNumenta/live" target="_blank">https://www.youtube.com/OfficialNumenta/live</a>. Archives of the live streams are <a href="https://www.youtube.com/playlist?list=PL3yXMgtrZmDr6hlnTDmsG4GFMv2htzArt" target="_blank">here</a>. For complete information, see <a href="https://github.com/htm-community/building-htm-systems" target="_blank">github</a>.
			</p>

			<p>
				This is a <strong><em>Work In Progress</em></strong>. It is incomplete, it may be inaccurate, it might be confusing, or broken, or filled with grammar errors. It is under construction.
			</p>

			<h2>What is this?</h2>

			<p>
			This is an interactive technical guide to building Hierarchical Temporal Memory software systems from scratch. It will help you build a simulation of neocortex using HTM neurons. The system we create will simulate both proximal and distal dendritic synapses. We will show you how to establish proximal connections between the cells within a layer to an input space, and how spatial pooling learns spatial patterns within that space over time by activating mini-columns within the layer. You will also learn some encoding strategies to get your data into sparse binary format.
			</p>

			<p>
			Distal connections between neurons in the active mini-columns allow sequence memory. We will show how single order temporal memory works when there is only 1 neuron in each mini-column. We’ll show how adding more cells per column creates a high-order memory. HTM neurons have predictive states. Cell populations can be inspected to extract predictions of future spatial features.
			</p>

			<h2>See Also</h2>

			<ul>
				<li>
					<a href="https://www.youtube.com/watch?v=XMB0ri4qgwc&index=1&list=PL3yXMgtrZmDqhsFQzwUC9V8MeeVOQ7eZ9">HTM School series</a> for an introduction to HTM systems
				</li>
				<li>
					<a href="http://www.numenta.com/resources/biological-and-machine-intelligence/">BAMI</a> and <a href="https://numenta.com/papers/">Numenta papers</a> for more detailed information
				</li>
				<li>
					<a href="https://discourse.numenta.org/categories">HTM Forum</a> for lively discussion
				</li>
			</ul>

		</Layout>
	</div>
)

export default Index
