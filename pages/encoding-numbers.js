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

export default function EncodingNumbers() {
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

        <SimpleScalarEncoder 
          id="simpleScalarEncoder"
          min={0} 
          max={55}
          val={27.5}
          bits={50}
          width={500}
        />

        <span><a href="#simpleScalarEncoder">¶</a>Figure 1:</span> A value between 0 and 55 is encoded into bits above. Move your mouse over the number line to see the encoding update. Hover over the bits in the encoding to see the value range each bit can represent.

        <p>Notice how the range of the on bits in the encoding always encompass the currently selected value. As you move towards the min and max values, you might notice there is a problem with this representation. If you increase the resolution and move the value, you can clearly see the number of bits in the representation decreasing by half as you approach the min and max values (watch the figure above as you <a>click here</a>). Did you notice anything? <a>Click again</a> and pay attention to the size of the encoding. It changes as the value moves toward the edge, and that breaks one of our <a href="/encoders"> established earlier</a>. Principle #4 of encoders states:</p>
        <blockquote>The output should have similar sparsity for all inputs and have enough one-bits to handle noise and subsampling.</blockquote>
        <p>Our super simple encoder detailed above is going to need a little more logic to handle the literal "edge cases" of minimum and maximum representations. We can do this by overriding the <code>applyBitmaskAtIndex()</code> function above with another one that accounts for this new behavior we want:</p>

        <div id="code-example-2">
          <CodeSyntax highlightedLines={[21,22,23,24,25,26,27,28]}>{codeExampleTwo}</CodeSyntax>
        </div>
        <span><a href="#code-example-2">¶</a>Code Example 2:</span> The only difference between the two encoders is highlighted above. We simply prevent the bitmask from getting smaller with some custom handling at the min and max.

        <p>Now when you hover near the min and max values, you'll see that the size of the representation remains consistent. You might also notice that some bits will now <a>represent more values than others</a>.</p>

        <DiagramStub 
          id="boundedScalarEncoder" 
          min={0} 
          max={55}
          val={27.5}
          bits={50}
          width={500}
        />
        <span><a href="#boundedScalarEncoder">¶</a>Figure 2:</span> Unlike the encodings in <em>Figure 1</em>, the size of all output encodings in this example will be the same because we have manually bounded the edges to force the representation to have a constant sparsity.

      </Layout>
    </div>
  )
}
