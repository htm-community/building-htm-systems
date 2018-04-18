class RelativeScalarEncoder {

    constructor(n, w, min, max) {
        this.n = n
        this.w = w
        this.min = min
        this.max = max
        this.range = max - min
        this._bitIndexToValue = d3.scaleLinear()
                                    .domain([0, n])
                                    .range([min, max])
    }

    encode(value) {
        let encoding = []
        for (let i = 0; i < this.n; i++) {
            let bitValue = this._bitIndexToValue(i)
            let bit = 0
            if (Math.abs(bitValue - value) <= this.w/2) bit = 1
            encoding.push(bit)
        }
        return encoding
    }

    getRangeFromBitIndex(i) {
        let v = this._bitIndexToValue(i)
        let left = Math.max(this.min, v - (this.w / 2))
        let right = Math.min(this.max, v + (this.w / 2))
        return [left, right]
    }

}

module.exports = RelativeScalarEncoder
