import React from 'react'
import Latex from 'react-latex'
import Layout from '../components/Layout'

export default function Encoders() {
	return (
		<div>
			<Layout>
				<h1>Encoders</h1>

				<h2>What is an Encoder?</h2>

				<p>Data must be encoded into sparse binary arrays for an HTM system to process it. These binary arrays define an input space for the Spatial Pooling algorithm. SDRs stream across this input space as spatial patterns over time. Spatial patterns must contain semantic meaning within their representations in order for HTM systems to process them.</p>

				<p>SDRs are quite different from standard computer representations, such as ASCII for text, in that meaning is encoded directly into the representation. An SDR consists of a large array of bits of which most are zeros and a few are ones. Each bit carries some semantic meaning, so if two SDRs have more than a few overlapping one-bits, then those two SDRs have similar meanings.</p>

				<p>Any data that can be converted into an SDR can be used in a wide range of applications using HTM systems. Consequently, the first step of using an HTM system is to convert a data source into an SDR using what we call an encoder. The encoder converts the native format of the data into an SDR that can be fed into an HTM system. The encoder is responsible for determining which output bits should be ones, and which should be zeros, for a given input value in such a way as to capture the important semantic characteristics of the data. Similar input values should produce highly overlapping SDRs.</p>

				<h2>The Encoding Process</h2>

				<p>The encoding process is analogous to the functions of sensory organs of humans and other animals. The cochlea, for instance, is a specialized structure that converts the frequencies and amplitudes of sounds in the environment into a sparse set of active neurons (Webster et al, 1992; Schuknecht, 1974). The basic mechanism for this process (Fig. 1) comprises a set of inner hair cells organized in a row that are sensitive to different frequencies. When an appropriate frequency of sound occurs, the hair cells stimulate neurons that send the signal into the brain. The set of neurons that are triggered in this manner comprise the encoding of the sound as a Sparse Distributed Representation.</p>

				<div className="figure">
					<img className="aligncenter " src="https://buildinghtm.systems/wp-content/uploads/2018/04/Screen-Shot-2018-04-13-at-12.53.53-PM.png" alt="" width="500" />
					<blockquote><strong>Figure 1</strong>: Cochlear hair cells stimulate a set of neurons based on the frequency of the sound.</blockquote>
				</div>

				<p>One important aspect of the cochlear encoding process is that each hair cell responds to a range of frequencies, and the ranges overlap with other nearby hair cells. This characteristic provides redundancy in case some hair cells are damaged but also means that a given frequency will stimulate multiple cells. And two sounds with similar frequencies will have some overlap in the cells that are stimulated. This overlap between representations is how the semantic similarity of the data is captured in the representation. It also means that the semantic meaning is distributed across a set of active cells, making the representation tolerant to noise or subsampling.</p>

				<p>The cochleae for different animals respond to different ranges of frequencies and have different resolutions for which they can distinguish differences in the frequencies. While very high frequency sounds might be important for some animals to hear precisely, they might not be useful to others. Similarly, the design of an encoder is dependent on the type of data. The encoder must capture the semantic characteristics of the data that are important for your application. Many of the encoder implementations in NuPIC take range or resolution parameters that allow them to work for a broad range of applications.</p>

				<p>There are a few important aspects that need to be considered when encoding data:</p>

				<ol>
					<li>Semantically similar data should result in SDRs with overlapping active bits.</li>
					<li>The same input should always produce the same SDR as output.</li>
					<li>The output should have the same dimensionality (total number of bits) for all inputs.</li>
					<li>The output should have similar sparsity for all inputs and have enough one-bits to handle noise and subsampling.</li>
				</ol>

				<p>In following sections we will examine each of these characteristics in detail and then describe how you can encode several different types of data. Note that several SDR encoders exist already and most people will not need to create their own. Those who do should carefully consider the above criteria.</p>

				<h4>1) Semantically similar data should result in SDRs with overlapping active bits</h4>

				<p>To create an effective encoder, you must understand the aspects of your data that should contribute to similarity. In the cochlea example above, the encoder was designed to make sounds with similar pitch have similar representations but did not take into account how loud the sounds were, which would require a different approach.</p>

				<p>The first step to designing an encoder is to determine each of the aspects of the data that you want to capture. For sound, the key features may be pitch and amplitude; for dates, it may be whether or not it is a weekend.</p>

				<p>The encoder should create representations that overlap for inputs that are similar in one or more of the characteristics of the data that were chosen. So for weekend encoders, dates that fall on Saturdays and Sundays should overlap with each other, but not as much or at all with dates that fall on weekdays.</p>

				<div className="aside">

					<h4>Preserving Semantics: A Formal Description</h4>

					<p>Here we formalize the encoding process by defining a set of rules that relate the semantic similarity of two inputs  with the number of overlapping one9bits in the corresponding encoded SDRs.</p>

					<p><Latex>Let $A$ be an arbitrary input space and let $S(n,k)$ be the set of SDRs of length $n$ with $k$ ON bits. An encoder $f$ is simply a function $f$ ∶ $A \rightarrow S(n,k)$. A distance score $d_A$ over space $A$ is a function $d_A$ ∶ $A \times A \rightarrow R$ that satisfies three conditions:</Latex></p>
          
					<ul>
						<li><Latex>1. $\forall x,y \in A,d_A (x,y) ≥ 0$</Latex></li>
						<li><Latex>2. $\forall x,y \in A,d_A (x,y) = d_A (y,x)$</Latex></li>
						<li><Latex>3. $\forall x \in A,d_A (x,x) = 0$</Latex></li>
					</ul>
          

					<p>Equation 1 requires the semantic similarity metric give a distance value of zero or greater. Equation 2 requires the distance metric to be symmetric. And Equation 3 requires that the distance between two identical values be zero.</p>

					<p>Given an input space and a distance score, we can evaluate an encoder by comparing the distance scores of pairs of inputs with the overlaps of their encodings. Two inputs that have low distance scores should have SDRs with high overlap, and vice versa. Moreover, if two SDRs have higher overlap than two other SDRs, then the former’s pre-encoding distance score should be lower than the latter’s. We state this formally below.</p>

					<p><Latex>For SDRs $s$ and $t$ with the same length, let $O(s,t)$ be the number of overlapping bits (i.e. the number of ON bits in $s$ & $t$). Then for an encoder $f$∶ $A \rightarrow S(n,k)$ and $\forall w,x,y,z \in A$,</Latex></p>

					<ul>
						<li><Latex>4. $O(f(w),f(x)) ≥ O(f(y),f(z)) \Leftrightarrow d_A (w,x) ≤ d_A (y,z)$</Latex></li>
					</ul>

					<p>Equation 4 states that encodings with more overlapping one bits means the values have greater semantic similarity  and, inversely, that values with greater semantic similarity will have encodings with more overlapping one bits. It is  not always possible to create an encoder that satisfies this, but the equation can be used as a heuristic to evaluate  the quality of an encoder.</p>

				</div>

				<h4>2: The same input should always produce the same SDR as output</h4>

        Encoders should be deterministic so that the same input produces the same output every time. Without this property, the sequences learned in an HTM system will become obsolete as the encoded representations for values change. Avoid creating encoders with random or adaptive elements.
        It can be tempting to create adaptive encoders that adjust representations to handle input data with an unknown range. There is a way to design an encoder to handle this case without changing the representations of inputs that is described below in the section labeled “A more flexible encoder method.” This method allows encoders to handle input with unbounded or unknown ranges.

				<h4>3: The output should have the same dimensionality (total number of bits) for all inputs</h4>

        The output of an encoder must always produce the same number of bits for each of its inputs. SDRs are compared and operated on using a bit-by-bit assumption such that a bit with a certain “meaning” is always in the same position. If the encoders produced varying bit lengths for the SDRs, comparisons and other operations would not be possible.

				<h4>4: The output should have similar sparsity for all inputs and have enough one-bits to handle noise and subsampling</h4>

        The fraction of total ON bits in an encoder can vary from around 1% to 35%, but the sparsity should be relatively fixed for a given application of an encoder. While keeping the sparsity the same should be the rule, small variations in sparsity will not have a negative effect.
        Additionally, there must be enough one-bits to handle noise and subsampling. A general rule of thumb is to have at least 20-25 one bits. Encoders that produce representations with fewer than 20 one bits do not work well in HTM systems since they may become extremely susceptible to errors due to small amounts of noise or non-determinism.
        
			</Layout>
		</div>
	)
}

