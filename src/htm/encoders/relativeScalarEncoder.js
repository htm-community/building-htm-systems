function encode(value, n, resolution, min, max) {
    let bitIndexToValue = d3.scaleLinear()
        .domain([0, n])
        .range([min, max])
    let encoding = []
    // For each bit in the encoding.
    for (let i = 0; i < n; i++) {
        let bitScalarValue = bitIndexToValue(i),
            bitValue = 0,
            valueDiff = bitScalarValue - value,
            valueDistance = Math.abs(valueDiff),
            radius = resolution / 2
        if (valueDistance <= radius) bitValue = 1
        encoding.push(bitValue)
    }
    return encoding
}

function encodeBounded(value, n, resolution, min, max) {
    let bitIndexToValue = d3.scaleLinear()
        .domain([0, n])
        .range([min, max])
    let encoding = []
    // For each bit in the encoding.
    for (let i = 0; i < n; i++) {
        let bitValue = bitIndexToValue(i),
            bit = 0,
            valueDiff = bitValue - value,
            valueDistance = Math.abs(valueDiff),
            radius = resolution / 2
        if (valueDistance <= radius) bit = 1
        // Keeps the bucket from changing size at min/max values
        if (value < (min + radius) && bitValue < (min + resolution)) bit = 1
        if (value > (max - radius) && bitValue > (max - resolution)) bit = 1
        encoding.push(bit)
    }
    return encoding
}


class RelativeScalarEncoder {

    constructor(n, resolution, min, max, bounded=false) {
        this.n = n
        this.resolution = resolution
        this.min = min
        this.max = max
        this.range = max - min
        this.bounded = bounded
        this._bitIndexToValue = d3.scaleLinear()
                                    .domain([0, n])
                                    .range([min, max])
    }

    encode(value) {
        if (this.bounded) {
            return encodeBounded(value, this.n, this.resolution, this.min, this.max)
        }
        return encode(value, this.n, this.resolution, this.min, this.max)
    }

    getRangeFromBitIndex(i) {
        let v = this._bitIndexToValue(i),
            res = this.resolution,
            min = this.min,
            max = this.max,
            radius = res / 2,
            left = Math.max(this.min, v - radius),
            right = Math.min(this.max, v + radius)
        // Keeps the bucket from changing size at min/max values
        if (this.bounded) {
            if (left < (min + radius)) left = min
            if (right > (max - radius)) right = max
        }
        return [left, right]
    }
}

module.exports = RelativeScalarEncoder
