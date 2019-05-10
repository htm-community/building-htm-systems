import Layout from '../components/Layout'
import SimpleScalarEncoder from '../components/diagrams/SimpleScalarEncoder'
import DiagramStub from '../components/diagrams/DiagramStub'
import CodeSyntax from '../components/CodeSyntax'

const exampleOne = `let d3 = require('d3')

const n = 100
const w = 18
const min = 0
const max = 55

let scale = d3.scaleLinear()
    .domain([min, max])
    .range([0, n])
let reverseScale = d3.scaleLinear()
    .domain([0, n])
    .range([min, max])

function applyBitmaskAtIndex(index) {
    let out = [],
        lowerValue = reverseScale(index - (w/2)),
        upperValue = reverseScale(index + (w/2))

    // For each bit in the encoding, we get the input domain
    // value. Using w, we know how wide the bitmask should
    // be, so we use the reverse scales to define the size
    // of the bitmask. If this index is within the value
    // range, we turn it on.
    for (let i = 0; i < n; i++) {
        let bitValue = reverseScale(i),
            bitOut = 0
        if (lowerValue <= bitValue && bitValue < upperValue) {
            bitOut = 1
        }
        out.push(bitOut)
    }
    return out
}
// Accepts a scalar value within the input domain, returns an
// array of bits representing the value.
function encode(value) {
    // Using the scale, get the corresponding integer
    // index for this value
    let index = Math.floor(scale(value))
    if (index > n - 1) {
        index = n - 1
    }
    return applyBitmaskAtIndex(index)
}`
const encodingOne = `[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,
 1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]`

 const codeExampleTwo = `function applyBoundedBitmaskAtIndex(index) {
  let out = [],
      lowerBuffer = reverseScale(w),
      upperBuffer = reverseScale(n - w),
      lowerValue = reverseScale(index - (w/2)),
      upperValue = reverseScale(index + (w/2))

  // For each bit in the encoding, we get the input domain 
  // value. Using w, we know how wide the bitmask should be,
  // so we use the reverse scales to define the size of the
  // bitmask. If this index is within the value range, we 
  // turnit on.
  for (let i = 0; i < n; i++) {
      let bitValue = reverseScale(i),
          bitOut = 0

      if (lowerValue <= bitValue && bitValue < upperValue) {
          bitOut = 1
      }

      // Keeps the output width from changing size at 
      // min/max values
      if (lowerValue < min && bitValue < lowerBuffer) {
          bitOut = 1
      }
      if (upperValue > max && bitValue >= upperBuffer) {
          bitOut = 1
      }
      out.push(bitOut)
  }
  return out
}`
const codeExampleThree = `let encoder = new BoundedScalarEncoder({
  min: 0, max: 50,
  w: 10, n: 100
})
function onNewValue(value) {
  let encoding = encoder.encode(value)
}`
const codeExampleFour = `applyBitmaskAtIndex(encoding, index) {
  for (let i = 1; i < w; i++) {
      let bitIndex = index + i
      // Adjust for out of range, by cycling around
      if (bitIndex >= n) bitIndex = bitIndex - n
      encoding[bitIndex] = 1
  }
  return encoding
}`
const codeExampleFive = `let values = [0,1,2,3,4]
let w = 5
let encoder = new CyclicScalarEncoder({
    w: w,
    n: values.length * w,
    min: 0,
    max: values.length
})`


class EncodingNumbers extends React.Component {

  state = {
    w: 10,
    n: 100,
  }

  makeScrubbableNumber(name, low, high, precision) {
    let elements = d3.selectAll(`[data-name='${name}']`)
    let positionToValue = d3.scaleLinear()
        .clamp(true)
        .domain([-100, +100])
        .range([low, high])
  
    function updateNumbers() {
        elements.text(() => {
            let format = `.${precision}f`
            return d3.format(format)(diagram[name])
        });
    }
  
    updateNumbers();
  
    elements.call(d3.drag()
                  .subject(() => ({x: positionToValue.invert(diagram[name]), y: 0}))
                  .on('drag', () => {
                      let value = positionToValue(d3.event.x)
                      updateNumbers()
                  }));
  }


  componentDidMount() {
    debugger
  }

  render() {
    return (
      <div>
        <Layout>
          
          <p>One of the most common data types to encode is <em>numbers</em>. This could be a numeric value of any kind – <em>82 degrees</em>, <em>$145.00</em> in sales, <em>34%</em> of capacity, etc. The sections below describe encoders for a single numeric value. In the sections below, we will introduce several strategies for encoding scalar values into binary arrays.</p>
  
          <h2 id="a-simple-encoder-for-numbers">
          A Simple Encoder for Numbers<a href="#a-simple-encoder-for-numbers">¶</a>
          </h2>
  
          <p>In the simplest approach, we can mimic how the cochlea encodes frequency. The cochlea has hair cells that respond to different but overlapping frequency ranges. A specific frequency will stimulate some set of these cells. We can mimic this process by encoding overlapping ranges of real values as active bits. Let's say we need to represent a range of values from <code>0 - 55</code>, and we have <code>100</code> bits to represent this space.</p>
  
          <p>This is like mapping a continuous value range of 0-55 onto a binary domain of <code>0-100</code> bits. Each scalar value has a corresponding bit associated with it, which we can find by scaling from one domain to another. Once we know the index of the bit array, we can expand the representation by adding more bits on either side of the current index. For simplicity, we're going to offset the actual linear scaling operation to a <a href="https://github.com/d3/d3-scale/blob/master/README.md#continuous-scales">third party library called "d3"</a>.</p> 
  
          <p>So, given constant values for <code>w</code>, <code>n</code>, <code>min</code>, and <code>max</code>, we can write the JavaScript code for this encoder like this:</p>
  
          <div id="code-example-1">
            <CodeSyntax>{exampleOne}</CodeSyntax>
          </div>
          
          <span>
            <a href="#code-example-1">¶</a>Code Example 1:
          </span> 
          Given constant values for the input value range and output parameters, a complete scalar encoder.
  
          <p>So, given that <code>value</code>  is a scalar number between <code>0</code> and <code>55</code>, the <code>encode()</code> function above will create an encoding <code>100</code> bits long with <code>18</code> bits on (the <em>bitmask</em>) to represent that specific value. Calling <code>encode(27.5)</code> would return a 100-element array, with a bitmask, or block of <code>1</code>s, in the middle:</p>
  
          <div id="encoding-example-1">
            <CodeSyntax>{encodingOne}</CodeSyntax>
          </div>
          <span><a href="#encoding-example-1">¶</a>Encoding Example 1:</span> The encoding for the scalar value <code>27.5</code>. Shows an 18-bit long bitmask.
  
          <p>Using only the code shown above, we can create an interactive visualization of this encoder. If you hover over the "scalar value" axis in the <strong><a href="#simpleScalarEncoder">Figure 1</a></strong> below, the red line moves and the current value being encoded changes. As the value changes, the encoding beneath it also changes, showing which bits are <em>on</em> (the blue ones) vs <em>off</em>. Also hover your mouse over the rectangles representing bits in the output encoding and see the range within the scalar input domain that activates that bit.</p>
  
          <figure>
            <SimpleScalarEncoder 
              id="simpleScalarEncoder"
              min={0} 
              max={55}
              val={27.5}
              w={this.state.w}
              n={this.state.n}
              diagramWidth={500}
            />
            <figcaption>
              <span><a href="#simpleScalarEncoder">¶</a>Figure 1:</span> A value between 0 and 55 is encoded into bits above. Move your mouse over the number line to see the encoding update. Hover over the bits in the encoding to see the value range each bit can represent.
            </figcaption>
          </figure>
  
          <p>Notice how the range of the on bits in the encoding always encompass the currently selected value. As you move towards the min and max values, you might notice there is a problem with this representation. If you increase the resolution and move the value, you can clearly see the number of bits in the representation decreasing by half as you approach the min and max values (watch the figure above as you <a>click here</a>). Did you notice anything? <a>Click again</a> and pay attention to the size of the encoding. It changes as the value moves toward the edge, and that breaks one of our <a href="/encoders"> established earlier</a>. Principle #4 of encoders states:</p>
          <blockquote>The output should have similar sparsity for all inputs and have enough one-bits to handle noise and subsampling.</blockquote>
          <p>Our super simple encoder detailed above is going to need a little more logic to handle the literal "edge cases" of minimum and maximum representations. We can do this by overriding the <code>applyBitmaskAtIndex()</code> function above with another one that accounts for this new behavior we want:</p>
  
          <div id="code-example-2">
            <CodeSyntax highlightedLines={[21,22,23,24,25,26,27,28]}>{codeExampleTwo}</CodeSyntax>
          </div>
          <span><a href="#code-example-2">¶</a>Code Example 2:</span> The only difference between the two encoders is highlighted above. We simply prevent the bitmask from getting smaller with some custom handling at the min and max.
  
          <p>Now when you hover near the min and max values, you'll see that the size of the representation remains consistent. You might also notice that some bits will now <a>represent more values than others</a>.</p>
  
          <figure>
            <SimpleScalarEncoder 
              id="boundedScalarEncoder" 
              bounded={true}
              min={0} 
              max={55}
              val={27.5}
              w={this.state.w}
              n={this.state.n}
              diagramWidth={500}
            />
            <figcaption>
              <span><a href="#boundedScalarEncoder">¶</a>Figure 2:</span> Unlike the encodings in <em>Figure 1</em>, the size of all output encodings in this example will be the same because we have manually bounded the edges to force the representation to have a constant sparsity.
            </figcaption>
          </figure>
  
          <h3 id="complete-code-reference">Complete Code Reference <a href="#complete-code-reference">¶</a></h3>
          <p>See the complete <code><a href="https://github.com/htm-community/simplehtm/blob/master/src/encoders/scalar.js" rel="noopener" target="_blank">ScalarEncoder</a></code> and <code><a href="https://github.com/htm-community/simplehtm/blob/master/src/encoders/boundedScalar.js" rel="noopener" target="_blank">BoundedScalarEncoder</a></code> JavaScript classes used in these examples. As an example, the following configuration produces the behavior visualized below.</p>
  
          <div id="code-example-3">
            <CodeSyntax>{codeExampleThree}</CodeSyntax>
          </div>
          <div>
            <span><a href="#code-example-3">¶</a>Code Example 3:</span>An example of the creation of an encoder and its usage.
          </div>
  
          <figure>
            <SimpleScalarEncoder 
              id="exampleBoundedScalarEncoder" 
              bounded={true}
              min={0} 
              max={50}
              val={27.5}
              w={this.state.w}
              n={this.state.n}
              diagramWidth={500}
            />
            <figcaption>
              <span><a href="#exampleBoundedScalarEncoder">¶</a>Figure 3:</span> The behavior of a bounded encoder with a continuous input range of <code>0-50</code> into a bit range of <code>10</code> on bits in a <code>100</code>-bit array.
            </figcaption>
          </figure>
  
          <h3 id="output-parameters">Output Parameters<a href="#output-parameters">¶</a></h3>
          <p>Encoders should give users control over the size and sparsity of encoders they create. Given constant values for the input range of 0-100, change the <code>w</code> and <code>n</code> values in the visualization below and observe how the output encoding changes. </p>
  
          <figure>
            <SimpleScalarEncoder 
              id="outputRange" 
              bounded={true}
              min={0} 
              max={50}
              val={27.5}
              w={this.state.w}
              n={this.state.n}
              diagramWidth={500}
            />
            <figcaption>
              <span><a href="#outputRange">¶</a>Figure 4:</span> This visual allows you to change the number of bits in the entire encoding {this.state.n} and the number of bits on ({this.state.w}).
            </figcaption>
          </figure>
  
          <h3 id="encoding-by-min-max">Encoding by min / max<a href="#encoding-by-min-max">¶</a></h3>
          <p>If you know the input domain for an encoder will remain constant, the easiest way to create an encoder is by defining a minimum and maximum input range. Once an encoder is created, these values cannot be changed or else encodings will be inconsistent. To see what an encoder configuration by min/max values might be like, change the <code>min</code> and <code>max</code> values in the panel below.</p>
          <DiagramStub 
            id="byMinMaxScalarEncoder" 
          />
          <span><a href="#byMinMaxScalarEncoder">¶</a>Figure 5:</span> Define the input range with <code>min</code> and <code>max</code>.
  
  
          <h3 id="encoding-by-bit-resolution">Encoding by bit resolution<a href="#encoding-by-bit-resolution">¶</a></h3>
          <p>It might make more sense to create an encoder based upon the range of values each bit in the output array can represent. That is what we mean by <code>resolution</code>, the range of input values one bit represents in the output space.</p>
          <DiagramStub 
            id="byResolutionScalarEncoder" 
          />
          <span><a href="#byResolutionScalarEncoder">¶</a>Figure 6:</span> The <code>resolution</code> is the range of values that one output bit represents.
          <p>The higher the <code>resolution</code>, the larger the input range. This makes sense when you think about each bit containing a larger range of values. For this example, I simply hard-coded the <code>min</code> value to be zero and updated the encoder's <code>max</code> based upon the <code>resolution</code> value.</p>
  
          <h2 id="cyclic-encoding">Cyclic Encoding<a href="#cyclic-encoding">¶</a></h2>
          <p>Remember above when we had to deal with the special cases of values being encoded at the beginning and end of the value range so all representations were the same size in the output array? Another way to deal with that is by assuming the entire output array is a continuous space -- that it wraps around from the end back to the beginning. We can do this simply by changing how the bitmask around the target index is created:</p>
  
          <div id="code-example-4">
            <CodeSyntax>{codeExampleFour}</CodeSyntax>
          </div>
          <span><a href="#code-example-4">¶</a>Code Example 4:</span> The only code we need to override is the code that applies the bitmask at the specified index.
  
          <p>Wow, our <code><a href="https://github.com/htm-community/simplehtm/blob/master/src/encoders/cyclicScalar.js" target="_blank">CyclicScalarEncoder</a></code> is the simplest one so far! As a value starts to approach the end of the encoding space, bits in the beginning of the array will activate and the value will <a>loop through the array as a value changes</a>. In the figure below, mouse over the line towards the max value and watch as the bits wrap to the beginning of the array.</p>
  
          <DiagramStub 
            id="cyclicEncoder" 
          />
          <span><a href="#cyclicEncoder">¶</a>Figure 7:</span> Because the block of on bits wraps as you approach the end of this array, it is natural to view this as a circle by choosing the `circle` display option above.
  
          <p>Change the display option in the visualization above to <code>circle</code>. When viewed in this way, the wrapping of the output bit makes more sense. Change the value being encoded by mousing over the value line above and observe the encoding. </p>
  
          <p>We'll be taking strong advantage of the simplicity of cyclic encoding when we talk about <a href="/encoding-time">encoding periods of time</a>, as well as in the next section, when we talk about <a href="/encoding-categories">category encoding</a>.</p>
  
          <h2 id="discrete-vs-continuous">Discrete Vs Continuous<a href="#discrete-vs-continuous">¶</a></h2>
  
          <p>All the examples shown so far have been of continuous encodings, because all our input ranges have been a continuous scale of numeric values. This also means that numbers near one another on the number line have been represented similarly. For example, in <strong>Figure 8</strong> below you can see encodings for two numbers: <code>4</code> and <code>5</code>. Given the encoding parameters defined below, you can see the overlapping bits in green.</p>
  
          <DiagramStub 
            id="continuousOverlap" 
          />
          <span><a href="#continuousOverlap">¶</a>Figure 8:</span> The encoding of <code>4</code> is in blue and <code>5</code> is in yellow. The overlapping bits are green.
  
  
          <p>This overlap means that these to values are semantically similar. They are represented similarly because their values are close on the number line. Compare the overlap of <a>two close values</a> vs two values farther from each other. <a>These two values</a> are far enough away from each other on the number line that they have no semantic similarity. Try changing the values of <code>w</code> and <code>n</code> while noticing how it affects the overlap between <a>close</a> and <a>far</a> values.</p>
  
          <p>Continuous encoding is great for ranges of input values, but sometimes we don't want encodings to overlap. You might want to separate an encoding space into equal sections that encode different categories of data, like this:</p>
  
          <DiagramStub 
            id="discreteEncoding" 
          />
          <span><a href="#discreteEncoding">¶</a>Figure 9:</span> By limiting the input to discrete values and making <code>n</code> an even multiple of <code>w</code>, it is easy to encode discrete scalar values with a <code>CyclicScalarEncoder</code>.
  
  
  
          <p>Accomplishing this is really quite simple if we use logic we've already defined for the <code><a href="https://github.com/htm-community/simplehtm/blob/master/src/encoders/cyclicScalar.js" target="_blank">CyclicScalarEncoder</a></code>. If we know how many different discrete values we need to encode and the number of bits to use for each, we can do this:</p>
  
          <div id="code-example-5">
            <CodeSyntax>{codeExampleFive}</CodeSyntax>
          </div>
          <span><a href="#code-example-5">¶</a>Code Example 5:</span>Use the <code>CyclicScalarEncoder</code>.
  
          <p>This <code><a href="https://github.com/htm-community/simplehtm/blob/master/src/encoders/cyclicScalar.js" target="_blank">CyclicScalarEncoder</a></code> is now configured to return discrete encodings for the discrete input values <code>[0,1,2,3,4]</code>, but remember we have to send it integers, not decimal values in order to get back non-continuous encodings. Watch us turn this little code snippet into a <code>CategoryEncoder</code> in the <a href="/encoding-categories">next section</a>.</p>  
  
          <hr />
          <strong>Next: <a href="/encoding-categories">Encoding Categories</a></strong>
  
        </Layout>
      </div>
    )
  } 
}

export default EncodingNumbers
