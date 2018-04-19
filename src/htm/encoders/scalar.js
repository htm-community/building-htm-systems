class ScalarEncoder {

    constructor(n, w, min, max) {
        this.n = n
        this.resolution = w
        this.numBuckets = n - w + 1
        this.range = max - min
        this.min = min
        this.max = max
        this._valueToBitIndex = d3.scaleLinear()
            .domain([0, this.n])
            .range([min, max])
        this.sparsity = w / n
    }

    encode(input) {
        let output = [];
        let firstBit;
        let min = this.min;
        firstBit = Math.floor(this.numBuckets * (input - min) / this.range)
        for (let i = 0; i < this.n; i ++) {
            output.push(0)
        }
        for (let i = 0; i < this.resolution; i++) {
            if (firstBit + i < output.length) output[firstBit + i] = 1;
        }
        return output;
    }

    getRangeFromBitIndex(i) {
        let value = this._valueToBitIndex(i)
        let start = value - this.max * this.sparsity / 2
        let end = value + this.max * this.sparsity / 2
        let out = []
        out.push(start)
        out.push(end)
        return out
    }
}


function PeriodicScalarEncoder(n, w, radius, minValue, maxValue) {
    let neededBuckets;
    // Distribute nBuckets points along the domain [minValue, maxValue],
    // including the endpoints. The resolution is the width of each band
    // between the points.

    if ((! n && ! radius)
        || (n && radius)) {
        throw new Error('Exactly one of n / radius must be defined.');
    }

    this.resolution = w;
    this.radius = radius;
    this.minValue = minValue;
    this.maxValue = maxValue;

    this.range = maxValue - minValue;

    if (n) {
        this.n = n;
        this.radius = this.resolution * (this.range / this.n);
        this.bucketWidth = this.range / this.n;
    } else {
        this.bucketWidth = this.radius / this.resolution;
        neededBuckets = Math.ceil((this.range) / this.bucketWidth);
        if (neededBuckets > this.resolution) {
            this.n = neededBuckets;
        } else {
            this.n = this.resolution + 1;
        }
    }

}

PeriodicScalarEncoder.prototype.getWidth = function() {
    return this.n;
};

PeriodicScalarEncoder.prototype.encode = function(input) {
    let output = [];
    let i, index;
    let iBucket = Math.floor((input - this.minValue) / this.bucketWidth);
    let middleBit = iBucket;
    let reach = (this.resolution - 1) / 2.0;
    let left = Math.floor(reach);
    let right = Math.ceil(reach);

    if (input < this.minValue || input >= this.maxValue) {
        throw Error('Input out of bounds: ' + input);
    }

    for (let i = 0; i < this.n; i ++) {
        output.push(0);
    }

    output[middleBit] = 1;

    for (i = 1; i <= left; i++) {
        index = middleBit - 1;
        if (index < 0) {
            index = index + this.n;
        }
        if (index > this.n) {
            throw Error('out of bounds');
        }
        output[index] = 1;
    }
    for (i = 1; i <= right; i++) {
        if ((middleBit + i) % this.n > this.n) {
            throw Error('out of bounds');
        }
        output[(middleBit + i) % this.n] = 1;
    }
    return output;

};

module.exports = {
    ScalarEncoder: ScalarEncoder,
    PeriodicScalarEncoder: PeriodicScalarEncoder,
}
