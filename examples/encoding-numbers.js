const codeExampleOne = `let d3 = require('d3')

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

module.exports = {
  code: [
    codeExampleOne, codeExampleTwo, codeExampleThree,
    codeExampleFour, codeExampleFive
  ],
  encodings: [encodingOne]
}
