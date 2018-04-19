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
        let encoding = [],
            resolution = this.resolution,
            n = this.n,
            max = this.max
        // For each bit in the encoding.
        for (let i = 0; i < n; i++) {
            let bitValue = this._bitIndexToValue(i),
                bit = 0,
                valueDiff = bitValue - value,
                valueDistance = Math.abs(valueDiff),
                radius = resolution / 2
            if (valueDistance <= radius) bit = 1
            // Keeps the bucket from changing size at min/max values
            if (this.bounded) {
                if (value < radius && bitValue < resolution) bit = 1
                if (value > (max - radius) && bitValue > (max - resolution)) bit = 1
            }
            encoding.push(bit)
        }
        return encoding
    }

    getRangeFromBitIndex(i) {
        let v = this._bitIndexToValue(i),
            res = this.resolution,
            max = this.max,
            radius = res / 2,
            left = Math.max(this.min, v - radius),
            right = Math.min(this.max, v + radius)
        // Keeps the bucket from changing size at min/max values
        if (this.bounded) {
            if (left < radius) left = 0
            if (right > (max - radius)) right = max
        }
        return [left, right]
    }
}

module.exports = RelativeScalarEncoder
